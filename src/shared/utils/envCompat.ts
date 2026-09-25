/**
 * Backward-compatible environment variable access for the NiyatnaRoute rebrand.
 *
 * The project was renamed from OmniRoute: every `OMNIROUTE_*` variable became
 * `NIYATNA_*`. Existing deployments still export the old names, so reads go
 * through here: the new name wins, the legacy name is a fallback, and the first
 * legacy read logs a deprecation warning once per variable.
 *
 * This shim is transitional. Removing it (and the `LEGACY_PREFIX` handling) is
 * tracked in the rebrand task list, Phase 8 (final audit).
 */

const NEW_PREFIX = "NIYATNA_";
const LEGACY_PREFIX = "OMNIROUTE_";

const warned = new Set<string>();

/** Map a legacy `OMNIROUTE_*` name to its `NIYATNA_*` equivalent. */
export function toNewEnvName(name: string): string {
  return name.startsWith(LEGACY_PREFIX)
    ? NEW_PREFIX + name.slice(LEGACY_PREFIX.length)
    : name;
}

/** Map a `NIYATNA_*` name back to its legacy `OMNIROUTE_*` equivalent. */
export function toLegacyEnvName(name: string): string {
  return name.startsWith(NEW_PREFIX)
    ? LEGACY_PREFIX + name.slice(NEW_PREFIX.length)
    : name;
}

function warnOnce(legacyName: string, newName: string): void {
  if (warned.has(legacyName)) return;
  warned.add(legacyName);
  // Never throw from an env read: a deployment that still uses the old name
  // must keep working; this is a nudge, not a gate.
  console.warn(
    `[niyatnaroute] environment variable ${legacyName} is deprecated; rename it to ${newName}`
  );
}

/**
 * Read an environment variable under its new `NIYATNA_*` name, falling back to
 * the legacy `OMNIROUTE_*` name. Accepts either form, so callers can pass
 * whichever they have in hand.
 */
export function readEnv(name: string): string | undefined {
  const newName = toNewEnvName(name);
  const legacyName = toLegacyEnvName(newName);
  const value = process.env[newName];
  if (value !== undefined) return value;
  const legacyValue = process.env[legacyName];
  if (legacyValue !== undefined) {
    warnOnce(legacyName, newName);
    return legacyValue;
  }
  return undefined;
}

/** Reset the once-per-variable deprecation warnings. Test helper. */
export function resetEnvCompatWarnings(): void {
  warned.clear();
}
