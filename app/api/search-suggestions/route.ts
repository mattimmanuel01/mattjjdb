import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('videos');

    // Get hashtag suggestions
    const hashtagSuggestions = await collection
      .aggregate([
        { $unwind: '$hashtags' },
        { 
          $match: { 
            'hashtags.tag': { $regex: query, $options: 'i' } 
          }
        },
        { 
          $group: { 
            _id: '$hashtags.tag', 
            count: { $sum: 1 } 
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            text: '$_id',
            type: { $literal: 'hashtag' },
            count: 1,
            _id: 0
          }
        }
      ])
      .toArray();

    // Get note text suggestions (extract keywords from notes)
    const noteSuggestions = await collection
      .find(
        { note: { $regex: query, $options: 'i' } },
        { note: 1, _id: 0 }
      )
      .limit(3)
      .toArray();

    // Extract meaningful phrases from notes
    const noteKeywords = noteSuggestions
      .map(doc => {
        const sentences = doc.note.split(/[.!?]+/);
        return sentences
          .filter(sentence => 
            sentence.toLowerCase().includes(query.toLowerCase()) && 
            sentence.length < 100
          )
          .map(sentence => sentence.trim())
          .slice(0, 2);
      })
      .flat()
      .slice(0, 3)
      .map(text => ({
        text,
        type: 'note',
        count: 1
      }));

    const suggestions = [...hashtagSuggestions, ...noteKeywords];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}