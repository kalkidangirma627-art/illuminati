import bcrypt from 'bcryptjs';
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
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['member', 'agent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'approved',
      balance: 0,
      profilePicture: ''
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id.toString(), email: savedUser.email, role: savedUser.role, name: savedUser.name },
      JWT_SECRET
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}
