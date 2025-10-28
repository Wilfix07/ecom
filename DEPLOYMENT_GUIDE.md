# 🚀 Deployment Guide - E-commerce Platform

## Overview
Complete guide for deploying the TechMart Haiti e-commerce platform to Vercel.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Create `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration  
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here

# Environment
VITE_APP_ENV=production
```

#### Get Your Keys:

**Supabase**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy Project URL and anon public key

**Stripe**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get Test Publishable Key from Developers → API keys
3. For production, get Live Publishable Key

---

## 🚀 Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### Method 2: GitHub Integration

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables (see below)
   - Click "Deploy"

---

## ⚙️ Environment Variables Configuration

### In Vercel Dashboard:

1. Go to your project settings
2. Click "Environment Variables"
3. Add the following:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
```

### Using Vercel CLI:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

---

## 🧪 Testing Checklist

### Authentication Flow
- [ ] User can register with email/password
- [ ] User can login with credentials
- [ ] User can logout
- [ ] Session persists across page refresh
- [ ] Protected routes require authentication
- [ ] Role-based access control works

### Payment Flow
- [ ] Add products to cart
- [ ] View cart with correct totals
- [ ] Navigate to checkout
- [ ] Fill shipping information
- [ ] Enter payment details (use Stripe test card: 4242 4242 4242 4242)
- [ ] Complete order creation
- [ ] Order saved to Supabase
- [ ] Cart clears after payment
- [ ] Redirect to success page

### Vendor Dashboard
- [ ] Vendor can access `/vendor/dashboard`
- [ ] Vendor can add products
- [ ] Vendor can edit products
- [ ] Vendor can update stock
- [ ] Vendor can view orders
- [ ] Non-vendors cannot access

### Admin Dashboard
- [ ] Admin can access `/admin/dashboard`
- [ ] Admin can approve products
- [ ] Admin can reject products
- [ ] Admin can update user roles
- [ ] Admin can view all users/products/orders
- [ ] Non-admins cannot access

### UI/UX Testing
- [ ] Mobile responsiveness (test on various screen sizes)
- [ ] Cart sidebar works correctly
- [ ] Product images load properly
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Loading states show correctly
- [ ] Navigation works smoothly
- [ ] Currency conversion displays correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: Environment Variables Not Loading
**Solution**: Ensure variables start with `VITE_` prefix in `.env` file

### Issue 2: Build Fails on Vercel
**Solution**: 
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Run `npm run build` locally to test

### Issue 3: CORS Errors
**Solution**: Configure CORS in Supabase dashboard for your Vercel domain

### Issue 4: Stripe Payment Fails
**Solution**: 
1. Ensure Stripe test mode keys are set
2. Use Stripe test cards (4242 4242 4242 4242)
3. Check Stripe dashboard for errors

### Issue 5: Database Connection Issues
**Solution**:
1. Verify Supabase URL and key
2. Check Row Level Security (RLS) policies
3. Ensure database tables exist

---

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable in Vercel Dashboard
2. Track page views and performance
3. Monitor errors

### Supabase Analytics
1. Check database performance
2. Monitor query times
3. View API usage

### Stripe Dashboard
1. Monitor payments
2. View test payments in test mode
3. Check for failed payments

---

## 🔧 Post-Deployment Tasks

### 1. Domain Setup (Optional)
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records

### 2. Database Backups
1. Set up daily backups in Supabase
2. Export data regularly
3. Keep backups off-site

### 3. Security Hardening
1. Enable Supabase Row Level Security (RLS)
2. Use environment variables for sensitive data
3. Enable HTTPS (automatic with Vercel)
4. Regularly update dependencies

### 4. Performance Optimization
1. Enable Vercel Edge Caching
2. Optimize images with Supabase Storage
3. Use CDN for static assets
4. Implement code splitting

---

## 🎯 Production Checklist

### Before Launch:
- [ ] All environment variables configured
- [ ] Database properly secured
- [ ] RLS policies implemented
- [ ] Test all user flows
- [ ] Mobile responsiveness verified
- [ ] Error handling in place
- [ ] Analytics set up
- [ ] Backup strategy in place
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)

### After Launch:
- [ ] Monitor error logs daily
- [ ] Check payment processing
- [ ] Review analytics weekly
- [ ] Update dependencies monthly
- [ ] Security audits quarterly
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] User feedback collection

---

## 📱 Mobile Testing

### Test on Real Devices:
1. **iPhone**: Safari, Chrome
2. **Android**: Chrome, Samsung Internet
3. **Tablets**: iPad, Android tablets

### Browser Testing:
- Chrome (Desktop & Mobile)
- Safari (Desktop & Mobile)
- Firefox (Desktop)
- Edge (Desktop)

### Screen Sizes:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

---

## 🔐 Security Best Practices

### 1. Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Rotate keys regularly

### 2. Database Security
- Use RLS policies
- Limit API access
- Regular backups
- Monitor access logs

### 3. Payment Security
- Use Stripe (PCI compliant)
- No credit card storage
- Secure payment endpoints
- Regular security audits

### 4. Authentication
- Strong password requirements
- Session management
- Secure token storage
- Role-based access control

---

## 📈 Scaling Considerations

### Database:
- Optimize queries with indexes
- Use pagination for large lists
- Implement caching
- Monitor query performance

### Storage:
- Use Supabase Storage for images
- Optimize image sizes
- Implement lazy loading
- Use CDN

### Performance:
- Enable Vercel Edge Caching
- Implement code splitting
- Optimize bundle size
- Use lazy loading

---

## 🎉 Launch!

### Final Steps:
1. ✅ All tests passing
2. ✅ Environment variables configured
3. ✅ Deployed to Vercel
4. ✅ Domain configured
5. ✅ Analytics enabled
6. ✅ Monitoring set up
7. ✅ Backups configured
8. ✅ Security hardened

**Your e-commerce platform is now live!** 🚀

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Guides](https://supabase.com/docs/guides)
- [Stripe Documentation](https://stripe.com/docs)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🆘 Support

If you encounter issues:
1. Check error logs in Vercel
2. Review Supabase logs
3. Test locally first
4. Check documentation
5. Contact support

**Good luck with your launch!** 🎊

