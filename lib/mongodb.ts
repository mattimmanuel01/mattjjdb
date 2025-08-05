import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = "mongodb+srv://furniture2023:testing1111@bjj.unjbknu.mongodb.net/?retryWrites=true&w=majority&appName=BJJ";
const DATABASE_NAME = "BJJ";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
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