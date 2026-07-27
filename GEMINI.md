# NiyatnaRoute — Security & Cleanliness Rules for AI Assistants

## 1. Core Vision & Goals

**NiyatnaRoute** is a fast, small, ultra-lightweight, and beautiful AI Gateway & LLM Proxy Router.

- **No Bloatware**: Zero Electron, zero A2A, zero Gamification, zero Notion/Obsidian memory, zero MITM proxy, zero 1Proxy, zero browser pool.
- **No Sponsors**: Zero Kimi / Moonshot / third-party sponsor banners, cards, or affiliate presets.
- **Hard Deletion**: Permanently delete unused files from disk. No dummy stubs, no commented-out code, no fake fallbacks.
- **Port 9999**: Default listener port is `9999` (`http://localhost:9999`).
- **Resource Footprint**: Max 1024MB RAM, ~0-2% idle CPU, fast Webpack bundler.

---

## 2. Hard Rules & Code Discipline

1. **Never commit secrets or credentials.** Use `.env` or vault.
2. **Never run destructive Git commands.** `git reset --hard`, `git push --force`, `git clean -fd` are strictly forbidden without explicit approval.
3. **Commit Local Only.** Do not push to remote repository without confirmation.
4. **Honesty Protocol.** Report true progress without exaggerations or fake completion claims.
5. **Simplicity First.** Keep diffs tight, minimal, and focused on the immediate task.
6. **Never add logic to `src/lib/localDb.ts`.** Re-export barrel only.
7. **Never write raw SQL in routes.** All persistence goes through `src/lib/db/` domain modules.
8. **Never silently swallow errors in SSE streams.**
9. **Always validate inputs with Zod schemas.**
10. **Always verify typescript & cycles.** Run `npm run typecheck:core` and `npm run check:cycles`.
11. **No File Pollution.** Tests belong in `tests/`, scripts in `scripts/`. Keep root clean.
