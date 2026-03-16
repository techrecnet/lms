# Hostinger Deployment Guide

## Current Status
- Frontend built and ready in `lms-frontend/dist/`
- SPA configured with `.htaccess` for URL rewriting
- Domain: https://recnet.in
- Issue: /login returns 404 (dist not deployed or CDN caching)

## Step 1: Prepare Build Locally

```bash
cd /Users/baljeet/Work/Projects/lms/lms-frontend

# Verify build is ready
ls -la dist/ | head

# Output should show: index.html, assets/, images/, .htaccess

# Zip for upload
zip -r dist.zip dist/
```

## Step 2A: Upload via SSH/SFTP (Recommended)

Replace placeholders:
- `USERNAME`: Hostinger username (from hPanel)
- `SERVER_HOST`: Hostinger server (e.g., `185.x.x.x` or `hostXXXX.hostinger.com`)
- `SSH_PORT`: SSH port (usually 22; check hPanel)

### Upload via SCP:
```bash
scp -P SSH_PORT /Users/baljeet/Work/Projects/lms/lms-frontend/dist.zip USERNAME@SERVER_HOST:/home/USERNAME/

# Example:
# scp -P 22 dist.zip user123@185.12.34.56:/home/user123/
```

### SSH in and extract:
```bash
ssh -p SSH_PORT USERNAME@SERVER_HOST

# Navigate to public_html
cd /home/USERNAME/public_html

# List current contents
ls -la

# Extract dist.zip (puts files inside ./dist/ folder)
unzip /home/USERNAME/dist.zip

# Move dist contents to public_html root
mv dist/* .

# Remove empty dist folder
rmdir dist

# Verify
ls -la index.html assets/ images/ .htaccess

# Exit
exit
```

## Step 2B: Upload via Hostinger File Manager (No SSH)

1. **Go to Hostinger hPanel** → Select your domain
2. **File Manager** (under Hosting)
3. **Navigate to `public_html`** folder
4. **Upload `dist.zip`** (drag & drop or upload button)
5. **Right-click `dist.zip`** → **Extract** (or context menu)
6. If files extract into `./dist/` folder:
   - **Open `./dist/`** folder
   - **Select all files** (Ctrl+A or Cmd+A)
   - **Cut** them
   - **Navigate back** to `public_html`
   - **Paste** files
   - **Delete empty `dist/` folder**
7. **Verify structure**:
   - `public_html/index.html`
   - `public_html/assets/`
   - `public_html/images/`
   - `public_html/.htaccess`

## Step 3: Purge Hostinger CDN Cache

1. **Go to hPanel** → **CDN** (or Caching)
2. **Find "Purge Cache"** button → Click
3. **Wait** 1-2 minutes for cache to clear
4. *Alternative*: Temporarily **disable CDN** until testing is complete

## Step 4: Test

### Test from browser:
```
https://recnet.in
https://recnet.in/login
https://recnet.in/signup
https://recnet.in/app
```

All should return HTTP 200 and load the React app (not 404).

### Test from CLI:
```bash
curl -I https://recnet.in/login
# Should return: HTTP/2 200 (not 404)

curl https://recnet.in/login | head -n 30
# Should show: <!doctype html> ... <title>Recnet LMS</title>
```

## Step 5: Verify Assets Load

1. Open browser DevTools (F12 or Cmd+Opt+I)
2. Go to **Console** tab
3. Navigate to https://recnet.in/login
4. Check for errors:
   - **Red "404" messages** = some assets or images missing
   - **No errors** = success!

If you see image 404s:
- Images folder may not be in `public_html`
- Check: `ls /home/USERNAME/public_html/images/`
- If missing, re-upload or copy:
  ```bash
  scp -r dist/images/ USERNAME@SERVER_HOST:/home/USERNAME/public_html/
  ```

## Backend API Configuration

If the frontend is making API calls to your backend, ensure:

**API Base URL** (in `lms-frontend/src/core/api.ts`):
```typescript
const API_URL = 'https://api.recnet.in' // or your backend domain
```

### Update if needed:
1. Edit `src/core/api.ts`
2. Set `API_URL` to your backend domain
3. Rebuild:
   ```bash
   npm run build
   ```
4. Re-upload new `dist/` to Hostinger (repeat Steps 1–3)

## Troubleshooting

### Still seeing 404 for /login?
- Confirm `.htaccess` exists in `public_html/` (not in a subfolder):
  ```bash
  ssh USERNAME@SERVER_HOST
  cat /home/USERNAME/public_html/.htaccess
  exit
  ```
- If missing, upload it manually:
  ```bash
  scp -P SSH_PORT lms-frontend/dist/.htaccess USERNAME@SERVER_HOST:/home/USERNAME/public_html/
  ```
- Purge CDN cache again

### Images not loading?
- Go to DevTools → Network tab
- Check image URLs and status codes
- Ensure `images/` folder is at `public_html/images/`
- Verify filenames match what's referenced in CSS

### CSS/JS not loading (404)?
- Ensure `public_html/assets/` folder exists with `.js` and `.css` files
- Example:
  ```
  public_html/
    assets/
      index-XXX.js
      index-XXX.css
    images/
      logo.svg
      ...
    index.html
    .htaccess
  ```

### Site loads but no styles (white page)?
- Check browser console for CSS import errors
- Ensure asset file hashes in `index.html` match actual files in `assets/` folder
- If not, rebuild locally:
  ```bash
  cd lms-frontend
  npm run build
  # Re-zip and re-upload dist/
  ```

## Next Steps (After Frontend Deployed)

1. **Deploy Backend** (lms-backend) to a separate server (or Hostinger if supported)
2. **Update API URL** in frontend if needed
3. **Test login flow**:
   - Navigate to https://recnet.in/login
   - Submit login (should call backend API)
   - Verify token stored and user redirected to dashboard
4. **Monitor logs**: Check Hostinger error logs if issues occur:
   - File Manager → `error_log` file in `public_html/`

## Support

- Hostinger Help: https://www.hostinger.com/help
- Check hPanel → Support → Live Chat for site-specific issues
