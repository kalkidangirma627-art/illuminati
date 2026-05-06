import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'lumosine-clone-secure-jwt-key-2026-change-in-production-please';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kalkidangirma627_db_user:jFAghIZQJaBY3lmd@cluster0.q1zcxji.mongodb.net/lumosine?retryWrites=true&w=majority&appName=Cluster0';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { name, profilePicture } = req.body;

    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

    const update = {};
    if (name) update.name = name;
    if (profilePicture !== undefined) update.profilePicture = profilePicture;

    const u = await User.findByIdAndUpdate(decoded.id, update, { new: true }).lean();
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user: u });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
