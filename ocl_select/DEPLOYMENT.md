# Deployment Checklist ✅

Use this checklist when deploying to production.

## Pre-Deployment

### Database Setup
- [ ] All migrations have been run successfully
- [ ] Sample cities data is populated
- [ ] Realtime is enabled on `students` table
- [ ] Database connection is stable

### Edge Functions
- [ ] `register-trip` function deployed
- [ ] `city-status` function deployed
- [ ] Functions are responding correctly
- [ ] CORS headers are configured for production domain

### Environment Variables
- [ ] Production Supabase project created
- [ ] `.env.local` configured for production
- [ ] All three environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL`

### Testing
- [ ] Tested registration flow locally
- [ ] Verified quota enforcement works
- [ ] Confirmed real-time updates work
- [ ] Tested error handling (duplicate registration, full quota)
- [ ] Mobile responsiveness checked
- [ ] Dark mode tested

## Vercel Deployment

### 1. Prepare Repository
- [ ] Code committed to Git
- [ ] Pushed to GitHub/GitLab
- [ ] `.env.local` is in `.gitignore` (should be!)

### 2. Vercel Setup
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Selected Next.js framework preset

### 3. Configure Environment Variables
Add these in Vercel dashboard:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL`

### 4. Deploy
- [ ] Triggered first deployment
- [ ] Deployment succeeded
- [ ] Preview URL works correctly

### 5. Production Domain (Optional)
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] SSL certificate active

## Post-Deployment

### Verification
- [ ] Open production URL
- [ ] Cities load correctly
- [ ] Register a test student
- [ ] Verify real-time updates work
- [ ] Check quota decrements properly
- [ ] Test duplicate registration prevention
- [ ] Test full quota scenario

### Monitoring
- [ ] Check Vercel Analytics dashboard
- [ ] Monitor Supabase function logs
- [ ] Review database performance
- [ ] Set up error notifications (optional)

### Security
- [ ] Environment variables are secure
- [ ] No sensitive data in client-side code
- [ ] CORS properly configured
- [ ] Rate limiting considered (optional)

## Production URLs

Record your production URLs here:

- **Frontend:** https://your-domain.vercel.app
- **Supabase Dashboard:** https://app.supabase.com/project/YOUR_PROJECT_REF
- **Edge Functions:** https://YOUR_PROJECT_REF.supabase.co/functions/v1

## Rollback Plan

If something goes wrong:

1. **Revert Vercel deployment:**
   - Go to Vercel Dashboard
   - Select previous deployment
   - Click "Promote to Production"

2. **Database issues:**
   - Supabase Dashboard → Database → Backups
   - Restore from latest backup

3. **Function issues:**
   - Redeploy functions: `supabase functions deploy function-name`
   - Check logs: `supabase functions logs function-name`

## Support Contacts

- **Vercel Support:** vercel.com/support
- **Supabase Support:** supabase.com/support
- **GitHub Issues:** [Your repo URL]

## Post-Launch Tasks

### Week 1
- [ ] Monitor registration patterns
- [ ] Check for any errors
- [ ] Gather user feedback
- [ ] Optimize based on usage

### Ongoing
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Review and optimize queries
- [ ] Update city quotas as needed

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________
