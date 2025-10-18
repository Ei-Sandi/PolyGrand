# Tailwind CSS v4 Migration Fix

## Problem
When running `npm run dev`, you encountered this error:
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. 
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS 
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

## Root Cause
The project was using **Tailwind CSS v4.1.14**, which has breaking changes from v3:
1. PostCSS plugin moved to separate package `@tailwindcss/postcss`
2. Configuration syntax changed from `@tailwind` directives to `@import "tailwindcss"`
3. Theme configuration moved from `tailwind.config.js` to CSS using `@theme` block

## Solution Applied ✅

### Step 1: Install New PostCSS Plugin
```bash
npm install -D @tailwindcss/postcss --legacy-peer-deps
```

### Step 2: Update `postcss.config.js`
**Before:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**After:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### Step 3: Update `src/index.css` (Tailwind v4 Syntax)
**Before (v3 syntax):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After (v4 syntax):**
```css
@import "tailwindcss";

@theme {
  --color-algorand: #00dc94;
  --color-algorand-dark: #00a870;
  
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  /* ... other theme colors ... */
}
```

## What Changed in Tailwind v4

### 1. Import Syntax
- **v3**: `@tailwind base; @tailwind components; @tailwind utilities;`
- **v4**: `@import "tailwindcss";`

### 2. Theme Configuration
- **v3**: Configured in `tailwind.config.js`
- **v4**: Configured in CSS using `@theme` block with CSS variables

### 3. PostCSS Plugin
- **v3**: `tailwindcss` package
- **v4**: `@tailwindcss/postcss` package

## Files Modified

1. ✅ `postcss.config.js` - Updated plugin name
2. ✅ `src/index.css` - Migrated to v4 syntax with `@import` and `@theme`

## Verification

Server now starts successfully:
```
✓ VITE v7.1.10 ready in 377 ms
➜ Local:   http://localhost:5173/
```

Visit http://localhost:5173/ and the app should load without errors! 🎉

## Note on CSS Lint Warnings ⚠️

You may still see VS Code lint warnings for `@theme` and `@apply`:
```
Unknown at rule @theme
Unknown at rule @apply
```

These are **false positives** - the CSS language server doesn't recognize Tailwind v4 directives yet. The code works perfectly! To suppress these:

1. Install Tailwind CSS IntelliSense extension
2. Or use the `.vscode/settings.json` already configured:
   ```json
   {
     "css.lint.unknownAtRules": "ignore",
     "css.validate": false
   }
   ```

## Additional Resources

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind v4 PostCSS Plugin](https://github.com/tailwindlabs/tailwindcss/tree/next/packages/%40tailwindcss-postcss)

---

**Status**: ✅ **FIXED** - Frontend now runs without errors!
