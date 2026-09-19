# Purge Spec: Electron Desktop App

## Overview
Remove ALL Electron desktop app integration. The Electron app (`electron/` dir) was already deleted, but hooks, API checks, and header profile entries remain.

## Files to DELETE
```
src/shared/hooks/useElectron.ts                # Electron detection hook
```

## Files to EDIT

### 1. `src/app/(dashboard)/dashboard/settings/components/AppearanceTab.tsx`
Remove `isElectron` checks, Electron-specific theme logic, Electron titlebar settings.

### 2. `src/app/(dashboard)/dashboard/HomePageClient.tsx`
Remove Electron detection, Electron-specific welcome messages, `window.electronAPI` calls.

### 3. `src/app/forgot-password/page.tsx`
Remove Electron deep-link handling.

### 4. `src/shared/components/layouts/DashboardLayout.tsx`
Remove Electron titlebar rendering, `useElectron()` hook usage, Electron CSS classes.

### 5. `src/shared/components/Header.tsx`
Remove Electron menu items, Electron window controls, `useElectron()` hook usage.

### 6. `open-sse/config/providerHeaderProfiles.ts`
Remove Electron-specific header profile entries (e.g., user-agent overrides for Electron).

### 7. `open-sse/services/inAppLoginService.ts`
Remove Electron in-app login flow, `isElectron` checks.

### 8. `open-sse/utils/sha3-512.ts`
Remove Electron-specific crypto fallback.

## Verification Commands
```bash
# Must return 0 results
grep -rni "electron\|electronAPI\|isElectron\|useElectron" src/ --include='*.ts' --include='*.tsx' | grep -v "node_modules"

# open-sse electron refs
grep -rni "electron" open-sse/ --include='*.ts' | grep -v "node_modules"

# Hook file must not exist
ls src/shared/hooks/useElectron.ts 2>/dev/null && echo "FAIL" || echo "PASS"

# Must exit 0
npm run typecheck:core
```

## Dependencies
- None (independent purge)
