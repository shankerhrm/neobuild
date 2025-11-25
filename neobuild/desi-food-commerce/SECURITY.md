# Security Information for Desi Food Commerce

## 🔒 Environment Variables Security

### What's Safe to Expose?

**✅ SAFE (Public):**
- `VITE_SUPABASE_URL` - This is your public Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - This is designed to be public by Supabase

**❌ NEVER EXPOSE:**
- `SUPABASE_SERVICE_ROLE_KEY` - This bypasses RLS (Row Level Security)
- Database passwords
- JWT secrets
- Private API keys from payment gateways
- Admin credentials

### Why Supabase Anon Key is Safe

The Supabase anonymous key (`anon key`) is **designed to be public** because:

1. **Row Level Security (RLS)** protects your data at the database level
2. The anon key only has limited permissions defined by your RLS policies
3. It cannot bypass security policies
4. All data access is controlled by PostgreSQL RLS, not the key itself

## 🛡️ Security Measures Implemented

### 1. Build-Time Security
- **Source maps disabled** - Prevents source code inspection
- **Console logs removed** in production
- **Variable names obfuscated** through Terser minification
- **Chunk names randomized** with hash-based naming

### 2. Database Security
- **Row Level Security (RLS)** enabled on all tables
- **Policy-based access control** - users can only access their own data
- **JWT-based authentication** with automatic token refresh
- **PKCE flow** for enhanced auth security

### 3. Application Security
- **Input validation** on all forms
- **XSS protection** through React's built-in escaping
- **CSRF protection** through SameSite cookies
- **Secure headers** configured

## 🔧 Additional Security Recommendations

### 1. Production Environment
```bash
# Use environment variables in production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Dashboard Settings
- Enable **Email confirmations** for new users
- Set up **Custom SMTP** for email delivery
- Configure **Rate limiting** in your Supabase project
- Enable **Real-time subscriptions** only for necessary tables

### 3. RLS Policies Verification
Verify these policies are active in your Supabase dashboard:
```sql
-- Users can only see their own data
CREATE POLICY "Users own data" ON users FOR ALL USING (auth.uid() = id);

-- Orders belong to users or providers
CREATE POLICY "Orders access" ON orders FOR SELECT USING (
  auth.uid() = user_id OR 
  provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
);
```

## 🚨 What to Monitor

### 1. Supabase Dashboard
- Monitor **API usage** for unusual spikes
- Check **Authentication** logs for failed attempts
- Review **Database** logs for suspicious queries

### 2. Application Logs
- Watch for **repeated failed requests**
- Monitor **error rates**
- Check **performance metrics**

## 📞 Security Contacts

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Contact: security@desifoods.com
3. Include detailed information about the vulnerability
4. Allow reasonable time for response before disclosure

## 🔄 Regular Security Tasks

### Weekly
- [ ] Review Supabase auth logs
- [ ] Check for failed login attempts
- [ ] Monitor API usage patterns

### Monthly
- [ ] Update dependencies
- [ ] Review RLS policies
- [ ] Audit user permissions
- [ ] Check database performance

### Quarterly
- [ ] Security audit of codebase
- [ ] Penetration testing
- [ ] Review and update security policies
- [ ] Staff security training

---

**Remember:** The Supabase anon key being visible is by design and is secure when proper RLS policies are in place. Your data is protected by PostgreSQL's robust security system, not by hiding the anon key.