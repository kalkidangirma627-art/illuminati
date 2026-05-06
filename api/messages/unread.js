import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'lumosine-super-secret-key-123';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://benaabo6_db_user:gPTzCShFudohBSWo@ac-jsr0zus-shard-00-00.4qojaun.mongodb.net:27017,ac-jsr0zus-shard-00-01.4qojaun.mongodb.net:27017,ac-jsr0zus-shard-00-02.4qojaun.mongodb.net:27017/?ssl=true&replicaSet=atlas-hmedvh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Illuminati';

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

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
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
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.warn('Cloud connection failed. Using Local Fallback.');
    useFallback = true;
    await initFallbackSeeds();
  }
}

setupDb();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (useFallback) {
      const count = getFallbackData().messages.filter(m => m.receiverId === decoded.id && !m.isRead).length;
      return res.status(200).json({ count });
    }
    
    const count = await Message.countDocuments({ receiverId: decoded.id, isRead: false });
    res.status(200).json({ count });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Get unread messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

