# Deploying Glossify to Vercel

## Prerequisites
- GitHub account
- Vercel account (free tier is perfect)
- Supabase project with tables set up

## Step-by-Step Deployment

### 1. Prepare Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI (fastest)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from glossify folder)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: glossify (or your choice)
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard (easier)**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Create React App**
   - Root Directory: `./glossify`
   - Build Command: `npm run build`
   - Output Directory: `build`

### 3. Set Environment Variables in Vercel

⚠️ **CRITICAL STEP** - Without these, your app won't connect to Supabase!

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Where to find these values:**
- Login to https://supabase.com
- Go to Project Settings → API
- Copy the URL and `anon` public key

3. Set for: **Production, Preview, and Development**
4. Click "Save"

### 4. Redeploy (if needed)

If you added env vars after first deployment:
```bash
vercel --prod
```

Or in Vercel Dashboard:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

### 5. Verify Deployment

Your app will be at: `https://glossify.vercel.app` (or similar)

**Test checklist:**
- [ ] App loads without errors
- [ ] Can create account
- [ ] Can login
- [ ] Can practice flashcards
- [ ] Settings save correctly
- [ ] PWA install prompt appears
- [ ] Can install as desktop/mobile app

### 6. Custom Domain (Optional)

In Vercel Dashboard → Domains:
1. Add your custom domain
2. Update DNS records as instructed
3. SSL certificate is automatic!

## Troubleshooting

### "supabaseClient.js:3 Uncaught Error: supabaseUrl is required"
→ Environment variables not set in Vercel. Go to step 3 above.

### Build fails with "react-scripts: not found"
→ Make sure you're deploying from the `glossify` folder, not the parent folder.

### Service worker not registering
→ This is normal in development. Service workers only activate in production (HTTPS).

### Tests failing in Vercel
→ Vercel doesn't run tests by default. Tests are for local development.

## Sharing Your App

Once deployed, share the Vercel URL with anyone:
```
https://glossify.vercel.app
```

They can:
1. Visit the URL
2. Create an account
3. Install as PWA (click "Installera" when prompted)
4. Use offline after first visit!

## Updating Your Deployment

Every time you push to GitHub:
```bash
git add .
git commit -m "Update message"
git push origin main
```

Vercel automatically:
- Detects the push
- Builds the new version
- Deploys to production
- Takes ~2 minutes

## Cost

**$0/month** on Vercel's free tier:
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- 100GB bandwidth/month
- Perfect for personal projects!

## Next Steps After Deployment

1. **Enable authenticated E2E tests:**
   - Create test user in Supabase
   - Add credentials to `.env.test`
   - Un-skip the 3 authenticated tests

2. **Set up CI/CD:**
   - Add GitHub Actions workflow
   - Run tests on every PR
   - Auto-deploy on merge to main

3. **Monitor usage:**
   - Vercel Analytics (free)
   - Supabase Dashboard → Database usage

Happy deploying! 🚀
