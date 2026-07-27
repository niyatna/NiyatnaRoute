import { getPersistedSecret, persistSecret } from "@/lib/db/secrets";
import { randomBytes } from "node:crypto";

/**
 * Ensures JWT_SECRET is available and returns it.
 * If process.env.JWT_SECRET is missing, attempts to load from SQLite persistent store
 * or generates a fresh 64-char base64 secret and saves it.
 */
export function getJwtSecret(): string {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== "") {
    return process.env.JWT_SECRET.trim();
  }
  
  try {
    const persisted = getPersistedSecret("jwtSecret");
    if (persisted && persisted.trim() !== "") {
      process.env.JWT_SECRET = persisted.trim();
      return persisted.trim();
    }
  } catch {
    // DB might be initializing
  }

  const generated = randomBytes(48).toString("base64");
  process.env.JWT_SECRET = generated;
  try {
    persistSecret("jwtSecret", generated);
  } catch {
    // DB write non-fatal
  }
  return generated;
}

export function getJwtSecretBytes(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}
