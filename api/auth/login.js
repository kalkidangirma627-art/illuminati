import bcryptjs as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

const User = mongoose.model('User', UserSchema);

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

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const { email, password } = req.body;
    
    const findUser = async () => {
      if (useFallback) return getFallbackData().users.find(u => u.email === email);
      return await User.findOne({ email });
    };
    
    const user = await findUser();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

