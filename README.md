# BJJ Video Library Dashboard

A Next.js dashboard for browsing and searching Brazilian Jiu-Jitsu videos with MongoDB integration.

## Features

- 🔍 **Smart Search** - Search through videos, notes, and hashtags with autocomplete suggestions
- 🏷️ **Hashtag Filtering** - Click on hashtags to filter videos instantly
- 📄 **Pagination** - Smooth pagination through large datasets
- 🎬 **Video Cards** - Beautiful video cards with thumbnails, hashtags, and metadata
- 📱 **Responsive Design** - Works perfectly on all device sizes
- 🌙 **Dark/Light Mode** - Built-in theme support with ShadCN
- ⚡ **Fast Performance** - Optimized MongoDB queries and caching

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Database**: MongoDB Atlas
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://furniture2023:testing1111@bjj.unjbknu.mongodb.net/?retryWrites=true&w=majority&appName=BJJ
DATABASE_NAME=BJJ
```

**For Vercel deployment**, add these environment variables in your Vercel dashboard:
- `MONGODB_URI` = Your MongoDB connection string
- `DATABASE_NAME` = Your database name

### 3. Sync Your Data

First, sync your data from the API to MongoDB:

```bash
# Go back to the root directory
cd ..

# Install sync script dependencies
npm install

# Run the sync
npm run sync
```

This will fetch the latest data from your API and populate MongoDB.

### 4. Start the Development Server

```bash
# Back to the outlier directory
cd outlier
npm run dev
```

**Note**: The `.env.local` file is already created with your MongoDB credentials and is ignored by git for security.

Visit [http://localhost:3000](http://localhost:3000) to see your dashboard!

## API Routes

- **`/api/videos`** - Fetch videos with pagination and filters
  - Query params: `page`, `limit`, `search`, `hashtag`, `isResource`
- **`/api/search-suggestions`** - Get search autocomplete suggestions
  - Query params: `q` (search query)
- **`/api/hashtags`** - Get all unique hashtags with counts

## Search Features

### Smart Search
- Search through video notes and hashtags
- Real-time autocomplete suggestions
- Pill-style hashtag suggestions with counts

### Filtering
- **Resources vs Footage** - Toggle between instructional content and raw footage
- **Hashtag Filters** - Click any hashtag to filter videos
- **Search + Filters** - Combine search with filters for precise results

### Keyboard Navigation
- Use arrow keys to navigate suggestions
- Press Enter to select
- ESC to close suggestions

## Data Structure

Your videos contain these fields:
```typescript
{
  _id: string;
  videoURL: string;
  startingTimestamp: number;
  note: string;
  hashtags: { _id: string; tag: string }[];
  isResource: boolean;
  updatedAt: string;
  trendingScore: number;
}
```

## Key Components

- **`SearchBar`** - Smart search with autocomplete (`/components/search-bar.tsx`)
- **`VideoCard`** - Beautiful video cards with thumbnails (`/components/video-card.tsx`)
- **`Pagination`** - Smooth pagination component (`/components/pagination.tsx`)
- **Dashboard** - Main page bringing everything together (`/app/dashboard/page.tsx`)

## Customization

### Styling
- Modify `/app/globals.css` for global styles
- Components use ShadCN variants for consistent theming
- Tailwind classes for responsive design

### Search Logic
- Customize search suggestions in `/app/api/search-suggestions/route.ts`
- Modify video fetching logic in `/app/api/videos/route.ts`

### Video Cards
- Thumbnail generation from YouTube URLs
- Hashtag pill interactions
- Timestamp overlays for video segments

## Performance Tips

1. **MongoDB Indexes**: Add indexes for better search performance:
   ```javascript
   // Create text index for search
   db.videos.createIndex({ "note": "text", "hashtags.tag": "text" })
   
   // Create compound indexes for filtering
   db.videos.createIndex({ "hashtags.tag": 1 })
   db.videos.createIndex({ "isResource": 1, "trendingScore": -1 })
   ```

2. **Pagination**: Uses skip/limit for efficient pagination
3. **Caching**: MongoDB connection caching for better performance

## Updating Data

To update your video database with the latest content:

```bash
# From the root directory
npm run sync
```

This will fetch fresh data from your API and update MongoDB automatically.
