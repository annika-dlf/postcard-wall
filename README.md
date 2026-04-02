# Postcard Wall

A mobile-first infinite scrapbook wall built with React, react-konva, and Supabase realtime.

## Setup

1. Install dependencies
   - `npm install --cache .npm-cache`
2. Create env file
   - `cp .env.example .env`
   - Fill in Supabase credentials
3. Run SQL schema
   - Execute `supabase/schema.sql` in Supabase SQL editor
4. Start app
   - `npm run dev`

## Features implemented

- Infinite whiteboard stage with drag-to-pan and zoom
- Viewport culling for postcard rendering
- Auto-center on postcard cluster at load
- Realtime subscription for new postcards
- Create flow: image picker -> flip editor -> publish
- Front/back drawing data serialization and text style controls
- Overlap-aware placement and randomized rotation
- Local-only dragging of existing postcards via long-press
- Lightbox modal with flip, share deep-link, and PNG export
- Download counter persisted via `increment_download_count`
- Deep-link route `/card/:id` to center + open postcard

## Production notes

- Deploy on Vercel with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Optional optimization: store pre-rendered front/back composites in Supabase Storage
- For 200+ cards, keep viewport culling buffer conservative and avoid heavy shadows
