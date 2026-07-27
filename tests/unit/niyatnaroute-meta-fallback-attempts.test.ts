import test from "node:test";
import assert from "node:assert/strict";
import { NIYATNAROUTE_RESPONSE_HEADERS } from "../../src/shared/constants/headers.ts";
import { buildNiyatnaRouteResponseMetaHeaders } from "../../src/domain/niyatnarouteResponseMeta.ts";

test("headers constant exposes the fallback-attempts key", () => {
  assert.equal(
    NIYATNAROUTE_RESPONSE_HEADERS.fallbackAttempts,
    "X-NiyatnaRoute-Fallback-Attempts"
  );
});

test("buildNiyatnaRouteResponseMetaHeaders emits the fallback-attempts count when > 0", () => {
  const h = buildNiyatnaRouteResponseMetaHeaders({ model: "gpt", provider: "openai", fallbackAttempts: 2 });
  assert.equal(h["X-NiyatnaRoute-Fallback-Attempts"], "2");
});

test("buildNiyatnaRouteResponseMetaHeaders omits the header when 0 / absent", () => {
  const none = buildNiyatnaRouteResponseMetaHeaders({ model: "gpt" });
  assert.equal(none["X-NiyatnaRoute-Fallback-Attempts"], undefined);
  const zero = buildNiyatnaRouteResponseMetaHeaders({ model: "gpt", fallbackAttempts: 0 });
  assert.equal(zero["X-NiyatnaRoute-Fallback-Attempts"], undefined);
});
