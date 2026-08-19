import mongoose from 'mongoose';
import dns from 'node:dns';

// Register global Mongoose plugin to clear server-side memory cache on any data mutations
mongoose.plugin((schema) => {
  const clearCache = function(this: any) {
    const modelName = (this.constructor && this.constructor.modelName) || (this.model && this.model.modelName);
    const ignoredModels = ['VisitorEvent', 'ChallengeAttempt', 'ChallengeSession', 'LessonProgress'];
    if (modelName && ignoredModels.includes(modelName)) {
      return;
    }
    try {
      import('./server-cache').then(({ serverCache }) => {
        serverCache.clear();
      });
    } catch (err) {
      console.error('Failed to clear cache on DB write:', err);
    }
  };

  schema.post('save', clearCache);
  schema.post('updateOne', clearCache);
  schema.post('updateMany', clearCache);
  schema.post('findOneAndUpdate', clearCache);
  schema.post('findOneAndDelete', clearCache);
  schema.post('deleteOne', clearCache);
  schema.post('deleteMany', clearCache);
  schema.post('insertMany', clearCache);
});

// Fix for Node.js querySrv ECONNREFUSED DNS resolution issues with MongoDB Atlas SRV records
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Custom DNS initialization warning:', e);
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}
const cached = global.mongoose!;

async function connectDB() {
  // Fix for Node.js querySrv ECONNREFUSED DNS resolution issues inside Next.js API runtime
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('[Mongoose Connection] Set DNS servers to:', dns.getServers());
  } catch (e: any) {
    console.warn('[Mongoose Connection] Failed to set DNS servers:', e.message);
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (MONGODB_URI.includes('your_username') || MONGODB_URI.includes('your_password') || MONGODB_URI.includes('your_cluster')) {
    throw new Error('MONGODB_URI in .env.local is currently set to a placeholder value. Please configure it with your real MongoDB Atlas connection string.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      // Asynchronously trigger database seeding on connection
      import('./db-seed').then(({ seedDatabase }) => {
        seedDatabase().catch((err) => console.error('Database seeding failed:', err));
      });
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
