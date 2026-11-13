const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (uri) {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  const memoryUri = mongoServer.getUri();
  await mongoose.connect(memoryUri);
  console.log('Connected to in-memory MongoDB');
}

async function disconnectDatabase() {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connectDatabase, disconnectDatabase };
