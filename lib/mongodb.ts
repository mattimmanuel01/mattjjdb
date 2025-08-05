import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

if (!DATABASE_NAME) {
  throw new Error('Please define the DATABASE_NAME environment variable in .env.local');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);

  await client.connect();
  const db = client.db(DATABASE_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export interface Video {
  _id: string;
  videoURL: string;
  startingTimestamp: number;
  note: string;
  hashtags: { _id: string; tag: string }[];
  isResource: boolean;
  updatedAt: string;
  trendingScore: number;
}