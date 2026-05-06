import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lumosine';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'agent', 'member'], default: 'member' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  balance: { type: Number, default: 0 },
  profilePicture: { type: String, default: '' },
  assignedAgentId: { type: String, default: '' }
}, { timestamps: true });

const requirementSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Requirement = mongoose.model('Requirement', requirementSchema);
const Message = mongoose.model('Message', messageSchema);

async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return false;
  }
}

async function seedDatabase() {
  try {
    const adminExists = await User.findOne({ email: 'admin@illuminati.ethiopia' });
    if (adminExists) return;

    const adminPassword = await bcrypt.hash('admin', 10);
    const agentPassword = await bcrypt.hash('agent', 10);
    const memberPassword = await bcrypt.hash('member', 10);

    const agent = await new User({
      name: 'Agent',
      email: 'agent@illuminati.ethiopia',
      password: agentPassword,
      role: 'agent',
      status: 'approved',
      balance: 15000
    }).save();

    const member = await new User({
      name: 'Member',
      email: 'member@illuminati.ethiopia',
      password: memberPassword,
      role: 'member',
      status: 'approved',
      balance: 24500,
      assignedAgentId: agent._id.toString()
    }).save();

    await new User({
      name: 'Admin',
      email: 'admin@illuminati.ethiopia',
      password: adminPassword,
      role: 'admin',
      status: 'approved',
      balance: 0
    }).save();

    const requirementTitles = ['Doc Processing', 'Biometrics', 'First Income', 'Doc Transaction', 'Payment'];
    for (let i = 0; i < requirementTitles.length; i++) {
      await new Requirement({
        memberId: member._id.toString(),
        title: requirementTitles[i],
        progress: (i + 1) * 15,
        isCompleted: i === 0
      }).save();
    }

    console.log('Database seeded with default users');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['member', 'agent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "member" or "agent"' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'approved',
      balance: 0,
      profilePicture: ''
    }).save();
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      JWT_SECRET
    );
    res.status(201).json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      JWT_SECRET
    );
    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/profile', authenticate, async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { ...user.toObject(), id: user._id.toString() } });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/agent/members', authenticate, requireRole('agent', 'admin'), async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password');
    const membersWithRequirements = await Promise.all(
      members.map(async (member) => {
        const requirements = await Requirement.find({ memberId: member._id.toString() });
        return { ...member.toObject(), id: member._id.toString(), requirements };
      })
    );
    res.json(membersWithRequirements);
  } catch (err) {
    console.error('Get members error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/agent/requirements/:id', authenticate, requireRole('agent', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, isCompleted, title } = req.body;
    const updates = {};
    if (progress !== undefined) updates.progress = Math.min(100, Math.max(0, parseInt(progress) || 0));
    if (isCompleted !== undefined) updates.isCompleted = Boolean(isCompleted);
    if (title !== undefined) updates.title = title;
    const requirement = await Requirement.findByIdAndUpdate(id, updates, { new: true });
    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found' });
    }
    res.json({ message: 'Requirement updated', requirement });
  } catch (err) {
    console.error('Update requirement error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/member/requirements', authenticate, requireRole('member'), async (req, res) => {
  try {
    const requirements = await Requirement.find({ memberId: req.user.id });
    res.json(requirements);
  } catch (err) {
    console.error('Get requirements error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/messages/history', authenticate, async (req, res) => {
  try {
    const { partnerId } = req.query;
    if (!partnerId) {
      return res.status(400).json({ error: 'partnerId is required' });
    }
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: partnerId },
        { senderId: partnerId, receiverId: req.user.id }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages/send', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'receiverId and content are required' });
    }
    const message = await new Message({
      senderId: req.user.id,
      receiverId,
      content,
      timestamp: new Date(),
      isRead: false
    }).save();
    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/messages/unread', authenticate, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user.id, isRead: false });
    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use(express.static(path.join(__dirname, '.')));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

async function start() {
  const connected = await connectDatabase();
  if (connected) {
    await seedDatabase();
  } else {
    console.warn('Running without database connection');
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
