# Database Setup Instructions for Desi Food Commerce

## Quick Setup

1. **Go to your Supabase project dashboard**
   - Visit: https://app.supabase.com/project/ghasefvsppxdsbfhwxap
   - Navigate to SQL Editor

2. **Run the setup script**
   - Copy the entire content from `supabase_setup.sql`
   - Paste it in the SQL Editor
   - Click "Run" to execute

3. **Verify the setup**
   - Go to Table Editor
   - You should see these tables:
     - users
     - providers  
     - dishes
     - orders
     - payments
     - invoices
     - reviews

## What the setup script does:

### 🗄️ **Creates Tables**
- **users**: Customer and provider user data
- **providers**: Business information for food providers
- **dishes**: Menu items with nutrition info
- **orders**: Customer orders with status tracking
- **payments**: Payment processing records
- **invoices**: Automated invoice generation
- **reviews**: Customer feedback system

### 🔒 **Security (RLS Policies)**
- Users can only see their own data
- Providers can only manage their own dishes/orders
- Public can view available dishes
- Secure API access with proper authentication

### 📊 **Sample Data**
- Sample provider: "Desi Kitchen"
- 10+ sample dishes with proper categorization
- Ready-to-use test data

### 🚀 **Performance**
- Optimized indexes for fast queries
- Full-text search on dishes
- Efficient data retrieval

### ⚡ **Automation**
- Auto-generate invoices when orders are delivered
- Update timestamps automatically
- Payment processing workflows

## Troubleshooting

### If you get 404 errors:
1. Make sure you ran the SQL script completely
2. Check if tables exist in Table Editor
3. Verify RLS policies are enabled
4. Ensure your API key has correct permissions

### If authentication fails:
1. Check your environment variables
2. Verify the Supabase URL and API key
3. Make sure RLS policies allow your operations

### Testing the setup:
1. Try accessing /menu page - should show sample dishes
2. Sign up as a new user - should work without errors
3. Sign up as a provider - should create provider record
4. Place a test order - should create order record

## Environment Variables

Make sure your `.env` file has:
```
VITE_SUPABASE_URL=https://ghasefvsppxdsbfhwxap.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the Supabase logs in your dashboard
3. Verify all tables were created properly
4. Make sure RLS policies are working

The application should work perfectly after running this setup script!
