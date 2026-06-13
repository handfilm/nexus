# NEXUS Portal — GitHub Deployment Guide

**Complete step-by-step guide to deploy NEXUS Portal to GitHub Pages**

---

## Prerequisites

- GitHub account (free or paid)
- Git installed locally
- Terminal/Command Prompt access

---

## Option 1: Deploy to GitHub Pages (Recommended for Demo)

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **New Repository**
3. Name it: `nexus-portal`
4. Description: "NEXUS Security & Audit Enterprise Portal"
5. Choose **Public** (for GitHub Pages)
6. Click **Create Repository**

### Step 2: Clone Repository Locally

```bash
# Navigate to your desired folder
cd /path/to/your/projects

# Clone the repository
git clone https://github.com/YOUR_USERNAME/nexus-portal.git
cd nexus-portal
```

### Step 3: Add NEXUS Portal Files

Copy these files into your cloned `nexus-portal` folder:
```
index.html
NEXUS_Core_Engine.js
AuditLifecycleController.js
ServiceEstimator.js
StatusTerminalUI.js
README.md
.gitignore
```

Verify file structure:
```bash
ls -la
# Output:
# index.html
# NEXUS_Core_Engine.js
# AuditLifecycleController.js
# ServiceEstimator.js
# StatusTerminalUI.js
# README.md
# .gitignore
```

### Step 4: Commit and Push

```bash
# Stage all files
git add .

# Commit with message
git commit -m "feat: Add NEXUS Portal v1.0 - Production SPA"

# Push to GitHub
git push -u origin main
```

### Step 5: Enable GitHub Pages

1. Go to repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select **main** branch
5. Click **Save**

**Your site is now live at:**
```
https://YOUR_USERNAME.github.io/nexus-portal/
```

---

## Option 2: Deploy to GitHub with Custom Domain

### Step 1-4: Same as Option 1

Follow Steps 1-4 above.

### Step 5: Add CNAME File

Create a file named `CNAME` (no extension) in your repository root:

```bash
echo "your-domain.com" > CNAME
```

Contents:
```
your-domain.com
```

### Step 6: Configure DNS

On your domain registrar (GoDaddy, Namecheap, etc.):

1. Go to DNS settings
2. Add these records:
   ```
   Type: A
   Value: 185.199.108.153
   
   Type: A
   Value: 185.199.109.153
   
   Type: A
   Value: 185.199.110.153
   
   Type: A
   Value: 185.199.111.153
   ```

3. Add CNAME record:
   ```
   Type: CNAME
   Value: YOUR_USERNAME.github.io
   ```

### Step 7: Enable HTTPS (automatic)

1. Go to repository Settings → Pages
2. Check **Enforce HTTPS**
3. Wait 5-10 minutes for certificate generation

**Your site is now live at:**
```
https://your-domain.com
```

---

## Option 3: Deploy from Local Server (Development)

### Using Python 3

```bash
# Navigate to project folder
cd /path/to/nexus-portal

# Start simple HTTP server
python3 -m http.server 8000

# Visit in browser
# http://localhost:8000
```

### Using Node.js (http-server)

```bash
# Install globally (one-time)
npm install -g http-server

# Navigate to project folder
cd /path/to/nexus-portal

# Start server
http-server

# Visit in browser
# http://localhost:8080
```

### Using Node.js (Express)

Create `server.js`:
```javascript
const express = require('express');
const app = express();

app.use(express.static(__dirname));

app.listen(3000, () => {
  console.log('NEXUS Portal running at http://localhost:3000');
});
```

Run:
```bash
npm install express
node server.js
```

---

## File Organization Checklist

```
✓ index.html                      (45 KB)
✓ NEXUS_Core_Engine.js            (8 KB)
✓ AuditLifecycleController.js      (6 KB)
✓ ServiceEstimator.js             (7 KB)
✓ StatusTerminalUI.js             (4 KB)
✓ README.md                       (12 KB)
✓ .gitignore                      (1 KB)
✓ DEPLOYMENT_GUIDE.md             (This file)
```

---

## Post-Deployment Configuration

### 1. Update Contact Information

Edit `index.html` footer section:
```html
<footer>
  <div class="container">
    <p>© 2025 NEXUS Security & Audit | nexus.handsandhead.com</p>
  </div>
</footer>
```

### 2. Replace Mock JWT Token

Edit `index.html` around line 450:

**Find:**
```javascript
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJORVhVUy0yMDI2LVg5IiwiYXVkaXRfbWF0cml4IjoicHJvYWN0aXZlIiwic2NvcGUiOiJmdWxsIiwiaWF0IjoxNzA1MDAwMDAwfQ.abc123';
```

**Replace with your real JWT:**
```javascript
const mockToken = 'YOUR_REAL_JWT_TOKEN_HERE';
```

### 3. Configure Backend Webhook

For Make.com integration:

1. In Make.com, set webhook target to:
   ```
   https://your-domain.com/api/telemetry
   ```

2. Backend endpoint should receive:
   ```json
   {
     "client_token": "NEXUS-2026-X9",
     "audit_track_step": 3,
     "active_compliance_index": 85.8,
     "critical_gaps_identified": 0,
     "pending_remediations": 4,
     "system_encryption_standard": "AES-256-GCM"
   }
   ```

3. Forward to frontend via WebSocket or iframe messaging:
   ```javascript
   // Frontend receives via postMessage
   window.addEventListener('message', (event) => {
     if (event.data.type === 'TELEMETRY') {
       NEXUS.ingestTelemetry(event.data.payload);
     }
   });
   ```

---

## Testing Deployment

### Local Testing

1. Open `index.html` in browser:
   ```bash
   open index.html
   # or on Windows:
   start index.html
   ```

2. Test features:
   - [ ] Theme toggle works (top-right buttons)
   - [ ] Language toggle works (EN/BN)
   - [ ] Terminal displays messages
   - [ ] Service cards load
   - [ ] Estimator calculates correctly
   - [ ] Lifecycle timeline renders
   - [ ] No console errors

### Remote Testing (After GitHub Push)

1. Visit your GitHub Pages URL:
   ```
   https://YOUR_USERNAME.github.io/nexus-portal/
   ```

2. Repeat local testing steps above

3. Test on mobile (tap view):
   ```
   http://localhost:8000 (if using local server)
   # or scan QR code to your GitHub Pages URL
   ```

---

## Troubleshooting Deployment

### Issue: "404 Not Found" on GitHub Pages

**Solution:**
- Verify files were pushed: `git log --oneline`
- Check repository Settings → Pages → Source is set to "main"
- Wait 2-3 minutes for GitHub Pages to rebuild
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Files load but scripts don't work

**Solution:**
- Check file paths in `index.html`:
  ```html
  <script src="./NEXUS_Core_Engine.js"></script>
  <!-- Note the "./" prefix for relative paths -->
  ```

### Issue: Styles don't load or look wrong

**Solution:**
- Verify all files are in same directory
- Check CSS custom variables in browser DevTools
- Test in different browser

### Issue: Theme/Language not persisting

**Solution:**
- Check localStorage is enabled in browser
- Clear site data: Settings → Privacy → Clear browsing data
- Test in incognito/private mode

---

## Making Updates

To update deployed site:

```bash
# Edit files locally
nano index.html
# ... make changes ...

# Commit changes
git add .
git commit -m "fix: Update portal description"

# Push to GitHub
git push origin main

# GitHub Pages auto-rebuilds (usually within 1 minute)
```

---

## Performance Optimization (Optional)

### Minify JavaScript

```bash
# Install minifier
npm install -g terser

# Minify each file
terser NEXUS_Core_Engine.js -o NEXUS_Core_Engine.min.js
terser AuditLifecycleController.js -o AuditLifecycleController.min.js
# ... etc for other files
```

Update `index.html`:
```html
<script src="./NEXUS_Core_Engine.min.js"></script>
```

### Minify CSS

Manually or use online minifier:
- https://www.minifier.org/

Copy minified CSS back into `<style>` tag in `index.html`.

### Enable Gzip Compression

GitHub Pages automatically gzips files over 1KB. No additional config needed.

---

## Security Best Practices

1. **Use HTTPS** (automatic with GitHub Pages)
2. **Validate JWT tokens** (add backend validation)
3. **Sanitize user inputs** (already done for telemetry schema)
4. **Set Content-Security-Policy** (add to backend headers)
5. **Keep dependencies updated** (no npm deps in this project)

---

## Monitoring & Analytics (Optional)

### Add Google Analytics

Add to `index.html` in `<head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Replace `GA_MEASUREMENT_ID` with your Google Analytics ID.

---

## Backup & Recovery

### Create Backup Branch

```bash
git branch backup-2025-06-14
git push origin backup-2025-06-14
```

### Restore from Backup

```bash
git checkout backup-2025-06-14
git push origin backup-2025-06-14:main
```

---

## Next Steps

1. ✅ Deploy to GitHub Pages
2. ✅ Test all features
3. ✅ Update contact info
4. ✅ Configure JWT tokens
5. ✅ Set up backend webhook
6. ✅ Enable monitoring/analytics
7. ✅ Share with clients

---

## Support Resources

- GitHub Pages Docs: https://docs.github.com/en/pages
- Git Documentation: https://git-scm.com/doc
- MDN Web Docs: https://developer.mozilla.org/

---

**Deployment Complete!** 🚀

Your NEXUS Portal is now live and ready for production use.
