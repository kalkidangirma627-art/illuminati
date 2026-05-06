const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://benaabo6_db_user:gPTzCShFudohBSWo@ac-jsr0zus-shard-00-00.4qojaun.mongodb.net:27017,ac-jsr0zus-shard-00-01.4qojaun.mongodb.net:27017,ac-jsr0zus-shard-00-02.4qojaun.mongodb.net:27017/?ssl=true&replicaSet=atlas-hmedvh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Illuminati';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connection successful');
  // Optionally list collections
  return mongoose.connection.db.listCollections().toArray();
})
.then(collections => {
  if (collections && collections.length > 0) {
    console.log('Collections:', collections.map(c => c.name).join(', '));
  } else {
    console.log('No collections found (or access restricted)');
  }
  mongoose.disconnect();
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  // Optionally hint at common causes
  if (err.message.includes('ECONNRESET') || err.message.includes('failed to connect')) {
    console.error('Hint: Check network, IP whitelist in MongoDB Atlas, or cluster pause state.');
  }
  if (err.message.includes('Authentication failed') || err.message.includes('Unauthorized')) {
    console.error('Hint: Invalid username/password. Check credentials in connection string.');
  }
  process.exit(1);
});