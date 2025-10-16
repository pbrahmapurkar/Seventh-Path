# How to Clear Service Worker Errors

## Quick Fix - Follow These Steps:

### Step 1: Unregister Old Service Worker

**Open your browser's Developer Console:**
- Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Firefox: Press `F12`
- Safari: Enable Develop menu, then `Cmd+Option+I`

**Then run this command in the Console tab:**

```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
    console.log('Service Worker unregistered');
  }
});
```

### Step 2: Clear Cache Storage

**In the same Developer Tools:**

**Chrome/Edge:**
1. Go to **Application** tab
2. Click **Storage** in left sidebar
3. Click **Clear site data** button
4. Check all boxes
5. Click **Clear data**

**Firefox:**
1. Go to **Storage** tab
2. Right-click **Cache Storage**
3. Select **Delete All**
4. Right-click **Service Workers**
5. Select **Unregister**

**Safari:**
1. Go to **Storage** tab
2. Select **Cache Storage** → Clear
3. Select **Service Workers** → Unregister

### Step 3: Hard Refresh

**Windows/Linux:**
- Chrome/Edge/Firefox: `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Chrome/Edge/Firefox: `Cmd + Shift + R`
- Safari: `Cmd + Option + R`

### Step 4: Verify It's Fixed

1. Open console (F12)
2. Refresh the page
3. You should see: `"Service Worker disabled in development mode"`
4. No more fetch errors!

---

## What Changed?

The service worker is now **disabled in development mode** by default.

**Why?**
- Service workers interfere with Vite's hot-reload
- Not needed for local development
- Causes fetch errors with Vite's special URLs

**When is it enabled?**
- Automatically enabled in production builds
- Can be enabled in dev by setting `enableSWInDev = true` in index.html

---

## Alternative: Use Incognito/Private Mode

If clearing doesn't work:
1. Close all browser windows
2. Open **Incognito/Private** window
3. Visit http://localhost:3006/
4. Service worker won't be registered (clean slate)

---

## Verify Service Worker Status

**Run this in console:**
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Active Service Workers:', regs.length);
  regs.forEach(reg => console.log('Scope:', reg.scope));
});
```

**Expected output:**
- Development: `Active Service Workers: 0`
- Production: `Active Service Workers: 1`

---

## Still Seeing Errors?

1. **Close ALL browser tabs** for localhost:3006
2. **Close DevTools**
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Restart browser**
5. Open fresh tab to http://localhost:3006/

---

## For Production Build

When you build for production, service worker will be enabled automatically:

```bash
yarn build
# Service worker will work in the built app
```

The service worker is only disabled during `yarn dev` for better developer experience.
