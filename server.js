import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://illuminati-pi.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://fallback:fallback@localhost:27017/lumosine';

let useFallback = false;
const FALLBACK_DB_PATH = path.resolve('db_fallback.json');

// --- Models ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true },
  assignedAgentId: { type: String },
  balance: { type: Number, default: 0 },
  profilePicture: { type: String, default: '' }
});

const RequirementSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
});

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const Requirement = mongoose.model('Requirement', RequirementSchema);
const Message = mongoose.model('Message', MessageSchema);

// --- Fallback ---
const getFallbackData = () => {
  if (!fs.existsSync(FALLBACK_DB_PATH)) return { users: [], requirements: [], messages: [] };
  try { return JSON.parse(fs.readFileSync(FALLBACK_DB_PATH, 'utf-8')); } catch (e) { return { users: [], requirements: [], messages: [] }; }
};
const saveFallbackData = (data) => fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2));

async function initFallbackSeeds() {
  const data = getFallbackData();
  if (data.users.length === 0) {
    const hashedAdmin = await bcrypt.hash('admin', 10);
    const hashedAgent = await bcrypt.hash('agent', 10);
    const hashedMember = await bcrypt.hash('member', 10);
    data.users.push(
      { _id: 'admin_id', name: 'System Admin', email: 'admin@illuminati.ethiopia', password: hashedAdmin, role: 'admin', status: 'approved', balance: 0 },
      { _id: 'agent_id', name: 'Alpha Agent', email: 'agent@illuminati.ethiopia', password: hashedAgent, role: 'agent', status: 'approved', balance: 15000 },
      { _id: 'member_id', name: 'John Member', email: 'member@illuminati.ethiopia', password: hashedMember, role: 'member', status: 'approved', balance: 24500, assignedAgentId: 'agent_id' }
    );
    const coreReqs = ['Document Processing', 'Biometrics Legitimacy', 'First Income', 'Document Transaction to HQ', 'Payment'];
    coreReqs.forEach((title, i) => {
      data.requirements.push({ _id: `req_${i}`, memberId: 'member_id', title, progress: (i + 1) * 15, isCompleted: i === 0 });
    });
    saveFallbackData(data);
  }
}

async function setupDb() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn('Cloud connection failed. Using Local Fallback.');
    useFallback = true;
    await initFallbackSeeds();
  }
}
setupDb();

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const findUser = async () => {
    if (useFallback) return getFallbackData().users.find(u => u.email === email);
    return await User.findOne({ email });
  };
  const user = await findUser();
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/user/me', authenticateToken, async (req, res) => {
  if (useFallback) {
    const u = getFallbackData().users.find(u => u._id === req.user.id);
    return res.json(u);
  }
  const u = await User.findById(req.user.id).select('-password');
  res.json(u);
});

app.post('/api/user/profile', authenticateToken, async (req, res) => {
  const { name, profilePicture } = req.body;
  if (useFallback) {
    const data = getFallbackData();
    const idx = data.users.findIndex(u => u._id === req.user.id);
    if (idx !== -1) {
      if (name) data.users[idx].name = name;
      if (profilePicture !== undefined) data.users[idx].profilePicture = profilePicture;
      saveFallbackData(data);
      return res.json({ user: data.users[idx] });
    }
  }
  const u = await User.findByIdAndUpdate(req.user.id, { name, profilePicture }, { new: true });
  res.json({ user: u });
});

app.get('/api/agent/members', authenticateToken, async (req, res) => {
  if (req.user.role !== 'agent') return res.sendStatus(403);
  if (useFallback) {
    const data = getFallbackData();
    const members = data.users.filter(u => u.role === 'member');
    return res.json(members.map(m => ({ ...m, id: m._id, requirements: data.requirements.filter(r => r.memberId === m._id) })));
  }
  const members = await User.find({ role: 'member' });
  const result = [];
  for (let m of members) {
    const reqs = await Requirement.find({ memberId: m._id });
    result.push({ ...m.toObject(), id: m._id, requirements: reqs });
  }
  res.json(result);
});

app.post('/api/agent/requirements/:id', authenticateToken, async (req, res) => {
  if (useFallback) {
    const data = getFallbackData();
    const idx = data.requirements.findIndex(r => r._id === req.params.id);
    if (idx !== -1) { data.requirements[idx] = { ...data.requirements[idx], ...req.body }; saveFallbackData(data); }
    return res.json({ message: 'ok' });
  }
  await Requirement.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'ok' });
});

app.get('/api/member/requirements', authenticateToken, async (req, res) => {
  if (useFallback) return res.json(getFallbackData().requirements.filter(r => r.memberId === req.user.id));
  res.json(await Requirement.find({ memberId: req.user.id }));
});

// --- MESSAGING ---
app.get('/api/messages/history', authenticateToken, async (req, res) => {
  const { partnerId } = req.query;
  if (useFallback) {
    const data = getFallbackData();
    const msgs = data.messages.filter(m => (m.senderId === req.user.id && m.receiverId === partnerId) || (m.senderId === partnerId && m.receiverId === req.user.id));
    return res.json(msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
  }
  const msgs = await Message.find({ $or: [{ senderId: req.user.id, receiverId: partnerId }, { senderId: partnerId, receiverId: req.user.id }] }).sort('timestamp');
  res.json(msgs);
});

app.post('/api/messages/send', authenticateToken, async (req, res) => {
  const { receiverId, content } = req.body;
  const msg = { senderId: req.user.id, receiverId, content, timestamp: new Date(), isRead: false };
  if (useFallback) {
    const data = getFallbackData();
    data.messages.push({ ...msg, _id: Date.now().toString() });
    saveFallbackData(data);
    return res.json(msg);
  }
  const newMsg = new Message(msg);
  await newMsg.save();
  res.json(newMsg);
});

app.get('/api/messages/unread', authenticateToken, async (req, res) => {
  if (useFallback) return res.json({ count: getFallbackData().messages.filter(m => m.receiverId === req.user.id && !m.isRead).length });
  const count = await Message.countDocuments({ receiverId: req.user.id, isRead: false });
  res.json({ count });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
