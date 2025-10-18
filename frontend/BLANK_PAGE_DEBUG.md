# Blank White Page Troubleshooting Guide

## Issue
Getting a blank white page when accessing http://localhost:5173/

## Solutions Applied

### 1. ✅ Downgraded to Tailwind CSS v3
**Problem**: Tailwind v4 had compatibility issues  
**Solution**: 
```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3 postcss autoprefixer --legacy-peer-deps
```

### 2. ✅ Reverted CSS to v3 Syntax
**File**: `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. ✅ Fixed PostCSS Configuration
**File**: `postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},      // Back to v3
    autoprefixer: {},
  },
}
```

### 4. ✅ Added Debug Logging
Added console.log statements to help diagnose issues:
- `src/main.tsx` - Logs when React starts
- `src/App.tsx` - Logs when App component renders

## How to Diagnose

### Step 1: Open Browser DevTools
1. Open http://localhost:5173/ in your browser
2. Press `F12` or `Ctrl+Shift+I` to open DevTools
3. Go to the "Console" tab

### Step 2: Check for Console Logs
You should see:
```
=== PolyGrand Main Starting ===
Root element: <div id="root"></div>
React app rendered
=== PolyGrand App Starting ===
```

### Step 3: Check for Errors
Look for any red error messages in the console. Common issues:

#### If you see "Failed to fetch" or network errors:
- Backend API might not be running
- Check `src/config/constants.ts` for correct API_BASE_URL

#### If you see "Module not found":
- Some dependency might be missing
- Run: `npm install --legacy-peer-deps`

#### If you see Pera Wallet errors:
- Pera Wallet initialization might be failing
- This is OK - the app should still render

#### If you see blank with no errors:
- Check the "Elements" tab in DevTools
- Look for the `<div id="root">` element
- See if any React components are inside it

### Step 4: Check Network Tab
1. Go to "Network" tab in DevTools
2. Reload the page
3. Check if all files are loading (200 status)
4. Look for any failed requests (red)

## Common Fixes

### Fix 1: Clear Cache and Reload
```bash
# In browser: Ctrl+Shift+R (hard reload)
# Or in terminal:
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Fix 2: Reinstall Dependencies
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### Fix 3: Check if Layout Component Works
The issue might be in the Layout component. Try this minimal version:

**Create `src/App.minimal.tsx`:**
```tsx
function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>PolyGrand Works!</h1>
      <p>If you see this, React is rendering correctly.</p>
    </div>
  );
}

export default App;
```

Then temporarily rename:
```bash
cd src
mv App.tsx App.tsx.full
mv App.minimal.tsx App.tsx
```

If this works, the issue is in one of the page components or Layout.

### Fix 4: Disable StrictMode
Sometimes StrictMode causes issues. Edit `src/main.tsx`:

```tsx
// Remove StrictMode wrapper
createRoot(rootElement).render(<App />);
```

### Fix 5: Check Zustand Persistence
The wallet store uses persist middleware which might cause issues:

Edit `src/hooks/useWallet.ts` - temporarily comment out persist:
```tsx
export const useWallet = create<WalletState>()(
  // persist(    // <-- Comment this
    (set, get) => ({
      // ... store code
    })
  // )         // <-- Comment this
);
```

## What to Look For in Console

### Good Signs ✅
- "PolyGrand Main Starting"
- "React app rendered"
- "PolyGrand App Starting"
- No red errors

### Bad Signs ❌
- Red error messages
- "Uncaught Error" or "Uncaught TypeError"
- "Failed to compile"
- No console output at all

## Server Issues

### Check if Vite is Running
```bash
# Should see:
VITE v7.1.10  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Restart the Server
```bash
# Kill the running server (Ctrl+C)
cd frontend
npm run dev
```

## File Checklist

Ensure these files exist and are correct:
- ✅ `index.html` - Has `<div id="root"></div>`
- ✅ `src/main.tsx` - Imports App and renders to root
- ✅ `src/App.tsx` - Exports default App component
- ✅ `src/index.css` - Has @tailwind directives
- ✅ `tailwind.config.js` - Configured correctly
- ✅ `postcss.config.js` - Has tailwindcss plugin

## Next Steps

1. **Open http://localhost:5173/ and check DevTools Console**
2. **Share any error messages you see**
3. **Note which console.log messages appear**
4. **Check if the page is truly blank or if there's a white background with no content**

The console logs I added will help us identify exactly where the issue is!

---

## Quick Debug Checklist

- [ ] Server running on http://localhost:5173/
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible
- [ ] "PolyGrand Main Starting" message appears
- [ ] "React app rendered" message appears  
- [ ] "PolyGrand App Starting" message appears
- [ ] No red errors in console
- [ ] Network tab shows all files loaded (200 status)

If all checkboxes are ✅ but page still blank, the issue is likely in the CSS or component rendering logic.
