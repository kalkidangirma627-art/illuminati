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
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lumosine';

let useFallback = false;

const User = mongoose.model('User', new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: String, status: String, assignedAgentId: String,
  balance: { type: Number, default: 0 }, profilePicture: { type: String, default: '' }
}));
const Requirement = mongoose.model('Requirement', new mongoose.Schema({
  memberId: String, title: String, progress: { type: Number, default: 0 }, isCompleted: { type: Boolean, default: false }
}));
const Message = mongoose.model('Message', new mongoose.Schema({
  senderId: String, receiverId: String, content: String,
  timestamp: { type: Date, default: Date.now }, isRead: { type: Boolean, default: false }
}));

const FB = path.resolve('db_fallback.json');
const getFB = () => { try { return JSON.parse(fs.readFileSync(FB,'utf-8')); } catch { return {users:[],requirements:[],messages:[]}; } };
const saveFB = (d) => fs.writeFileSync(FB, JSON.stringify(d,null,2));

async function seed() {
  const d = getFB();
  if (!d.users.length) {
    d.users.push(
      {_id:'admin_id',name:'Admin',email:'admin@illuminati.ethiopia',password:await bcrypt.hash('admin',10),role:'admin',status:'approved',balance:0},
      {_id:'agent_id',name:'Agent',email:'agent@illuminati.ethiopia',password:await bcrypt.hash('agent',10),role:'agent',status:'approved',balance:15000},
      {_id:'member_id',name:'Member',email:'member@illuminati.ethiopia',password:await bcrypt.hash('member',10),role:'member',status:'approved',balance:24500,assignedAgentId:'agent_id'}
    );
    ['Doc Processing','Biometrics','First Income','Doc Transaction','Payment'].forEach((t,i)=>d.requirements.push({_id:`req_${i}`,memberId:'member_id',title:t,progress:(i+1)*15,isCompleted:i===0}));
    saveFB(d);
  }
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 }).then(() => {
  useFallback = false;
  console.log('MongoDB connected');
}).catch((err) => {
  useFallback = true;
  console.error('MongoDB failed:', err.message);
  seed();
});

mongoose.connection.on('disconnected', () => { useFallback = true; });
mongoose.connection.on('reconnected', () => { useFallback = false; });

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(403).json({ error: 'Invalid token' }); }
};

app.get('/api/health', (_, res) => res.json({ ok: true, useFallback, db: mongoose.connection.readyState }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });
    if (!['member','agent'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (useFallback) {
      const d = getFB();
      if (d.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
      const u = { _id: 'u_'+Date.now(), name, email, password: await bcrypt.hash(password,10), role, status:'approved', balance:0, profilePicture:'' };
      d.users.push(u); saveFB(d);
      return res.status(201).json({ token: jwt.sign({id:u._id,email,role,name}, JWT_SECRET), user:{id:u._id,name,email,role} });
    }
    if (await User.findOne({email}).lean()) return res.status(400).json({ error: 'Email exists' });
    const u = await new User({ name, email, password: await bcrypt.hash(password,10), role, status:'approved', balance:0, profilePicture:'' }).save();
    res.status(201).json({ token: jwt.sign({id:u._id.toString(),email:u.email,role:u.role,name:u.name}, JWT_SECRET), user:{id:u._id.toString(),name:u.name,email:u.email,role:u.role} });
  } catch(e) { console.error('Register:', e.message); res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = useFallback ? getFB().users.find(u => u.email === email) : await User.findOne({email}).lean();
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
    const id = user._id?.toString?.() || user._id;
    res.json({ token: jwt.sign({id,email:user.email,role:user.role,name:user.name}, JWT_SECRET), user:{id,name:user.name,email:user.email,role:user.role} });
  } catch(e) { console.error('Login:', e.message); res.status(500).json({ error: e.message }); }
});

app.get('/api/user/me', auth, async (req, res) => {
  try {
    const u = useFallback ? getFB().users.find(u => u._id === req.user.id) : await User.findById(req.user.id).select('-password').lean();
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json(u);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/user/profile', auth, async (req, res) => {
  try {
    const { name, profilePicture } = req.body || {};
    if (useFallback) {
      const d = getFB(); const i = d.users.findIndex(u => u._id === req.user.id);
      if (i===-1) return res.status(404).json({ error: 'Not found' });
      if (name) d.users[i].name = name;
      if (profilePicture !== undefined) d.users[i].profilePicture = profilePicture;
      saveFB(d); return res.json({ user: d.users[i] });
    }
    const u = await User.findByIdAndUpdate(req.user.id, { name, profilePicture }, { new: true }).lean();
    res.json({ user: u });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/agent/members', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ error: 'Forbidden' });
    if (useFallback) {
      const d = getFB();
      return res.json(d.users.filter(u => u.role==='member').map(m => ({...m, requirements: d.requirements.filter(r => r.memberId===m._id)})));
    }
    const members = await User.find({role:'member'}).lean();
    res.json(await Promise.all(members.map(async m => ({...m, id:m._id.toString(), requirements: await Requirement.find({memberId:m._id}).lean()}))));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/agent/requirements/:id', auth, async (req, res) => {
  try {
    if (useFB) { const d=getFB(); const i=d.requirements.findIndex(r=>r._id===req.params.id); if(i!==-1){d.requirements[i]={...d.requirements[i],...req.body};saveFB(d);} return res.json({message:'ok'}); }
    await Requirement.findByIdAndUpdate(req.params.id, req.body);
    res.json({message:'ok'});
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/member/requirements', auth, async (req, res) => {
  try {
    if (useFallback) return res.json(getFB().requirements.filter(r => r.memberId===req.user.id));
    res.json(await Requirement.find({memberId:req.user.id}).lean());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages/history', auth, async (req, res) => {
  try {
    const pid = req.query.partnerId;
    if (useFallback) {
      const msgs = getFB().messages.filter(m=>(m.senderId===req.user.id&&m.receiverId===pid)||(m.senderId===pid&&m.receiverId===req.user.id));
      return res.json(msgs.sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp)));
    }
    res.json(await Message.find({$or:[{senderId:req.user.id,receiverId:pid},{senderId:pid,receiverId:req.user.id}]}).sort('timestamp').lean());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/messages/send', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body || {};
    if (!receiverId || !content) return res.status(400).json({ error: 'Receiver and content required' });
    if (useFallback) {
      const msg = {senderId:req.user.id,receiverId,content,timestamp:new Date(),isRead:false,_id:Date.now().toString()};
      const d=getFB(); d.messages.push(msg); saveFB(d);
      return res.json(msg);
    }
    res.json((await new Message({senderId:req.user.id,receiverId,content,timestamp:new Date(),isRead:false}).save()).toObject());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages/unread', auth, async (req, res) => {
  try {
    if (useFallback) return res.json({count:getFB().messages.filter(m=>m.receiverId===req.user.id&&!m.isRead).length});
    res.json({count:await Message.countDocuments({receiverId:req.user.id,isRead:false})});
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.use(express.static('.'));
app.get('/*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.resolve('index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
