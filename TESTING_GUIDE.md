# Seventh Path - Testing Guide

## Quick Start

The app is now running at: **http://localhost:3006/**

## Service Worker Issue Resolution

The service worker errors you saw were caused by:
1. Old service worker trying to cache non-existent files
2. Incorrect caching strategy for Vite development

**Fixed by:**
- Updated `/app/public/sw.js` with network-first strategy
- Improved error handling in `/app/index.html`
- Changed cache strategy to work with hot-reload

## How to Test New Features

### 1. Light Theme (Default)
**Steps:**
1. Open http://localhost:3006/
2. Verify: App loads with light, soft colors (not dark)
3. Check: Soft blue primary, white backgrounds, readable text
4. Navigate through: Home → History → Insights → Settings
5. Verify: All screens have consistent light theme

**Expected:** Clean, eye-friendly light interface

---

### 2. Dark Mode Toggle
**Steps:**
1. Go to Settings (bottom nav)
2. Find "Appearance" section
3. Toggle "Dark Mode" switch
4. Verify: Theme changes smoothly to dark
5. Refresh page → Verify: Dark theme persists
6. Toggle back to light → Verify: Smooth transition

**Expected:** Theme preference saved in localStorage

---

### 3. CSV Export
**Steps:**
1. Create 2-3 test habits (with different frequencies)
2. Mark some habits as completed
3. Go to Settings → "Data Management"
4. Click "Export Data"
5. Verify: CSV file downloads
6. Open CSV in text editor or Excel
7. Check: All habits, stats, and completion history present

**Expected:** File named `seventh-path-export-YYYYMMDD.csv`

---

### 4. CSV Import
**Steps:**
1. Keep the exported CSV
2. Delete 1 habit from the app
3. Go to Settings → "Data Management"
4. Click "Import Data" → Select the CSV file
5. Wait for import
6. Check dialog: Shows "Imported: X, Skipped: Y"
7. Verify: Deleted habit is restored
8. Check completion history: Should match original

**Expected:** All habits restored with full history

---

### 5. Notification Suppression
**This requires mobile testing (Android/iOS)**

**Setup:**
1. Build the app: `cd /app && yarn build`
2. Sync to Capacitor: `npx cap sync`
3. Open Android Studio or Xcode
4. Run on device

**Test:**
1. Create a habit with reminder in 2 minutes
2. Wait for notification to arrive
3. Mark habit as DONE
4. Wait for next scheduled time
5. Verify: No notification fires (already completed)

**Expected:** No notification for completed habit

---

## Clear Browser Cache (If Issues Persist)

If you still see service worker errors:

1. **Chrome/Edge:**
   - Open DevTools (F12)
   - Application tab → Service Workers
   - Click "Unregister" for localhost:3006
   - Application tab → Cache Storage → Delete all
   - Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

2. **Firefox:**
   - F12 → Storage tab
   - Service Workers → Unregister
   - Cache Storage → Delete all
   - Hard refresh: Ctrl+F5

3. **Safari:**
   - Develop → Empty Caches
   - Develop → Service Workers → Unregister

---

## Known Development Quirks

1. **Service Worker in Dev Mode:**
   - May show console warnings in dev mode (normal)
   - Works perfectly in production build

2. **Hot Reload:**
   - CSS changes apply immediately
   - Component changes may require manual refresh
   - Service worker updates trigger auto-reload

3. **Notifications:**
   - Web browser notifications are limited
   - Full functionality requires native mobile app
   - Use Capacitor build for complete testing

---

## Building for Mobile

### Android:
```bash
cd /app
yarn build
npx cap sync
npx cap open android
```

Then in Android Studio: Build → Generate Signed Bundle/APK

### iOS:
```bash
cd /app
yarn build
npx cap sync
npx cap open ios
```

Then in Xcode: Product → Archive

---

## Troubleshooting

### App won't load:
1. Check if vite is running: `ps aux | grep vite`
2. Restart: `pkill -f vite && cd /app && yarn dev`
3. Clear node_modules: `rm -rf node_modules && yarn install`

### Theme not changing:
1. Clear localStorage: `localStorage.clear()` in console
2. Hard refresh browser
3. Check console for errors

### CSV Export fails:
1. Create at least 1 habit first
2. Check browser console for errors
3. Verify browser allows downloads

### Service Worker errors:
1. Unregister old service worker (see Clear Cache section)
2. Hard refresh browser
3. Check `/app/public/sw.js` exists

---

## Next Steps After Testing

1. ✅ Verify all features work
2. ✅ Test on real mobile device
3. ✅ Update version in package.json to 1.0.8
4. ✅ Build production APK/AAB
5. ✅ Submit to Google Play / App Store

---

## Questions?

Check the main documentation:
- `/app/FEATURE_IMPLEMENTATION_SUMMARY.md` - Technical details
- `/app/README.md` - Project overview
- Console logs - Enable verbose logging in browser DevTools

**Current Status:** Development complete, ready for QA testing! ✅
