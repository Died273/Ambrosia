# GitHub Pages Deployment Setup

## What Changed

### 1. `next.config.ts`
- Added `output: 'export'` - enables static site generation
- Added `distDir: 'docs'` - builds directly to docs folder (GitHub Pages compatible)
- Added `images.unoptimized: true` - required for static export (no image optimization server)

### 2. `.gitignore`
- Added comment to ensure `docs/` folder is NOT ignored by git
- The build output needs to be committed for GitHub Pages

### 3. `public/CNAME`
- Created CNAME file in public folder
- Next.js automatically copies it to docs/ during build
- Contains: `ambrosia-app.com`

### 4. Chat Route
- Temporarily moved `/chat` to `/_chat_disabled` 
- Dynamic routes require special handling for static export
- Can be re-enabled when chat is fully implemented with proper static generation

## How to Deploy

### Build Command
```bash
npm run build
```

This will:
1. Generate static HTML/CSS/JS files
2. Output everything to the `docs/` folder
3. Include your CNAME file

### Commit & Push
```bash
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### GitHub Pages Settings
1. Go to your repo Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/docs**
5. Save

Your site will be available at `https://ambrosia-app.com` (once DNS is configured)

## Important Notes

### Environment Variables
GitHub Pages is **static only** - no server-side code runs. Your Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) need to be:

1. **Hardcoded in the build** - the values get baked into the static files
2. **Safe to expose** - only use the `NEXT_PUBLIC_` anon key, never private keys

The app will use these at runtime in the browser.

### Limitations
- No API routes (they require a server)
- No server-side rendering (SSR)
- No dynamic routes at build time (we disabled chat for this reason)
- All pages are pre-rendered as static HTML

### When Chat is Ready
To re-enable chat with static export, you'll need to either:
1. Pre-generate static paths for all possible match IDs
2. Use client-side routing only (404 fallback)
3. Or deploy to Vercel/Netlify instead (recommended for dynamic features)

## Alternative: Deploy to Vercel
If you want full Next.js features (dynamic routes, API routes, etc):
1. Connect your GitHub repo to Vercel
2. It auto-deploys on every push
3. No need for `output: 'export'` configuration
4. Better for apps with Supabase and dynamic features
