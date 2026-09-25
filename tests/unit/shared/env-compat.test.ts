import test from "node:test";
import assert from "node:assert/strict";

import {
  readEnv,
  toNewEnvName,
  toLegacyEnvName,
  resetEnvCompatWarnings,
} from "../../../src/shared/utils/envCompat.ts";

// These tests deliberately use the LEGACY "OMNIROUTE_" spelling: proving the
// shim still understands it is the whole point of the file.

test("toNewEnvName maps the legacy prefix", () => {
  assert.equal(toNewEnvName("OMNIROUTE_API_KEY"), "NIYATNA_API_KEY");
  assert.equal(toNewEnvName("NIYATNA_API_KEY"), "NIYATNA_API_KEY");
});

test("toLegacyEnvName maps back to the legacy prefix", () => {
  assert.equal(toLegacyEnvName("NIYATNA_API_KEY"), "OMNIROUTE_API_KEY");
  assert.equal(toLegacyEnvName("OMNIROUTE_API_KEY"), "OMNIROUTE_API_KEY");
});

test("readEnv prefers the new name", () => {
  resetEnvCompatWarnings();
  process.env.NIYATNA_TEST_PREF = "new";
  process.env.OMNIROUTE_TEST_PREF = "old";
  try {
    assert.equal(readEnv("NIYATNA_TEST_PREF"), "new");
  } finally {
    delete process.env.NIYATNA_TEST_PREF;
    delete process.env.OMNIROUTE_TEST_PREF;
  }
});

test("readEnv falls back to the legacy name", () => {
  resetEnvCompatWarnings();
  process.env.OMNIROUTE_TEST_FALLBACK = "legacy";
  try {
    assert.equal(readEnv("OMNIROUTE_TEST_FALLBACK"), "legacy");
    assert.equal(readEnv("NIYATNA_TEST_FALLBACK"), "legacy");
  } finally {
    delete process.env.OMNIROUTE_TEST_FALLBACK;
  }
});

test("readEnv returns undefined when neither name is set", () => {
  resetEnvCompatWarnings();
  assert.equal(readEnv("NIYATNA_TEST_ABSENT"), undefined);
});
