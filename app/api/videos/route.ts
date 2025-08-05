import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const hashtag = searchParams.get('hashtag') || '';
    const isResource = searchParams.get('isResource');

    const { db } = await connectToDatabase();
    const collection = db.collection('videos');

    // Build search query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { note: { $regex: search, $options: 'i' } },
        { 'hashtags.tag': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (hashtag) {
      query['hashtags.tag'] = hashtag;
    }
    
    if (isResource !== null && isResource !== undefined) {
      query.isResource = isResource === 'true';
    }

    // Get total count
    const total = await collection.countDocuments(query);
    
    // Get paginated results
    const videos = await collection
      .find(query)
      .sort({ trendingScore: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}