import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('videos');

    const hashtags = await collection
      .aggregate([
        { $unwind: '$hashtags' },
        { 
          $group: { 
            _id: '$hashtags.tag', 
            count: { $sum: 1 } 
          }
        },
        { $sort: { count: -1 } },
        { $limit: 100 },
        {
          $project: {
            tag: '$_id',
            count: 1,
            _id: 0
          }
        }
      ])
      .toArray();

    return NextResponse.json({ hashtags });
  } catch (error) {
    console.error('Hashtags API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch hashtags' }, { status: 500 });
  }
}