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

const RequirementSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const Requirement = mongoose.model('Requirement', RequirementSchema);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
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

    if (decoded.role !== 'agent') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

    const members = await User.find({ role: 'member' }).lean();
    const result = [];
    for (let m of members) {
      const reqs = await Requirement.find({ memberId: m._id }).lean();
      result.push({ ...m, id: m._id.toString(), requirements: reqs });
    }
    res.status(200).json(result);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
