import test from "node:test";
import assert from "node:assert/strict";

import {
  attachNiyatnaRouteMetaHeaders,
  buildNiyatnaRouteResponseMetaHeaders,
  buildNiyatnaRouteSseMetadataComment,
  formatNiyatnaRouteCost,
  getNiyatnaRouteTokenCounts,
} from "../../src/domain/niyatnarouteResponseMeta.ts";
import { APP_CONFIG } from "../../src/shared/constants/appConfig.ts";
import { NIYATNAROUTE_RESPONSE_HEADERS } from "../../src/shared/constants/headers.ts";

test("getNiyatnaRouteTokenCounts normalizes common usage shapes", () => {
  assert.deepEqual(
    getNiyatnaRouteTokenCounts({
      prompt_tokens: 12,
      completion_tokens: 5,
    }),
    { input: 12, output: 5 }
  );
  assert.deepEqual(
    getNiyatnaRouteTokenCounts({
      input_tokens: "9",
      output_tokens: "4",
    }),
    { input: 9, output: 4 }
  );
});

test("buildNiyatnaRouteResponseMetaHeaders formats provider alias, tokens, latency, and cost", () => {
  const headers = buildNiyatnaRouteResponseMetaHeaders({
    provider: "claude",
    model: "claude-sonnet-4-6",
    cacheHit: true,
    latencyMs: 1234.6,
    usage: {
      prompt_tokens: 11,
      completion_tokens: 7,
    },
    costUsd: 0.00123456789,
  });

  assert.equal(headers["X-NiyatnaRoute-Provider"], "cc");
  assert.equal(headers["X-NiyatnaRoute-Model"], "claude-sonnet-4-6");
  assert.equal(headers["X-NiyatnaRoute-Cache-Hit"], "true");
  assert.equal(headers["X-NiyatnaRoute-Latency-Ms"], "1235");
  assert.equal(headers["X-NiyatnaRoute-Tokens-In"], "11");
  assert.equal(headers["X-NiyatnaRoute-Tokens-Out"], "7");
  assert.equal(headers["X-NiyatnaRoute-Response-Cost"], "0.0012345679");
});

test("buildNiyatnaRouteResponseMetaHeaders keeps ASCII model header values unchanged", () => {
  const headers = buildNiyatnaRouteResponseMetaHeaders({
    provider: "openai",
    model: "gpt-4o-mini",
  });

  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.model], "gpt-4o-mini");
});

test("buildNiyatnaRouteResponseMetaHeaders percent-encodes non-ASCII model header values", () => {
  const model = "free-mix/[假流式]gemini-3.5-flash";
  const headers = buildNiyatnaRouteResponseMetaHeaders({
    provider: "openai",
    model,
  });

  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.model], encodeURIComponent(model));
  assert.doesNotThrow(() => new Headers(headers));
});

test("buildNiyatnaRouteResponseMetaHeaders strips control characters from string header values", () => {
  const headers = buildNiyatnaRouteResponseMetaHeaders({
    provider: "openai",
    model: "free\r\nX-Injected: yes\u0000-model",
    requestId: "req-1\nreq-2\rreq-3\u0007",
  });

  assert.doesNotMatch(headers[NIYATNAROUTE_RESPONSE_HEADERS.model], /[\r\n\u0000-\u001f\u007f]/);
  assert.doesNotMatch(headers[NIYATNAROUTE_RESPONSE_HEADERS.requestId], /[\r\n\u0000-\u001f\u007f]/);
  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.model], "freeX-Injected: yes-model");
  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.requestId], "req-1req-2req-3");
  assert.doesNotThrow(() => new Headers(headers));
});

test("buildNiyatnaRouteResponseMetaHeaders always emits X-NiyatnaRoute-Version", () => {
  const headers = buildNiyatnaRouteResponseMetaHeaders({ provider: "openai", model: "gpt" });
  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.version], APP_CONFIG.version);

  // Even with no provider/model at all, the version is still attached.
  const bare = buildNiyatnaRouteResponseMetaHeaders({});
  assert.equal(bare[NIYATNAROUTE_RESPONSE_HEADERS.version], APP_CONFIG.version);
});

test("buildNiyatnaRouteResponseMetaHeaders emits X-NiyatnaRoute-Request-Id only when provided", () => {
  const withId = buildNiyatnaRouteResponseMetaHeaders({ model: "gpt", requestId: "req-123" });
  assert.equal(withId[NIYATNAROUTE_RESPONSE_HEADERS.requestId], "req-123");

  const noId = buildNiyatnaRouteResponseMetaHeaders({ model: "gpt" });
  assert.equal(noId[NIYATNAROUTE_RESPONSE_HEADERS.requestId], undefined);

  const nullId = buildNiyatnaRouteResponseMetaHeaders({ model: "gpt", requestId: null });
  assert.equal(nullId[NIYATNAROUTE_RESPONSE_HEADERS.requestId], undefined);

  const blankId = buildNiyatnaRouteResponseMetaHeaders({ model: "gpt", requestId: "   " });
  assert.equal(blankId[NIYATNAROUTE_RESPONSE_HEADERS.requestId], undefined);
});

test("attachNiyatnaRouteMetaHeaders mutates a Headers instance in place, preserving existing entries", () => {
  const headers = new Headers({ "Content-Type": "application/json" });
  attachNiyatnaRouteMetaHeaders(headers, {
    provider: "openai",
    model: "gpt",
    requestId: "req-abc",
  });

  assert.equal(headers.get("Content-Type"), "application/json");
  assert.equal(headers.get(NIYATNAROUTE_RESPONSE_HEADERS.version), APP_CONFIG.version);
  assert.equal(headers.get(NIYATNAROUTE_RESPONSE_HEADERS.requestId), "req-abc");
  assert.equal(headers.get(NIYATNAROUTE_RESPONSE_HEADERS.model), "gpt");
});

test("attachNiyatnaRouteMetaHeaders mutates a plain record in place, preserving existing entries", () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  attachNiyatnaRouteMetaHeaders(headers, {
    provider: "openai",
    model: "gpt",
  });

  assert.equal(headers["Content-Type"], "application/json");
  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.version], APP_CONFIG.version);
  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.model], "gpt");
  // No requestId provided → header omitted.
  assert.equal(headers[NIYATNAROUTE_RESPONSE_HEADERS.requestId], undefined);
});

test("buildNiyatnaRouteSseMetadataComment emits comment lines compatible with SSE", () => {
  const comment = buildNiyatnaRouteSseMetadataComment({
    provider: "openai",
    model: "gpt-4o-mini",
    usage: {
      prompt_tokens: 4,
      completion_tokens: 2,
    },
    latencyMs: 50,
    costUsd: formatNiyatnaRouteCost(0),
  });

  assert.match(comment, /^: x-niyatnaroute-cache-hit=false/m);
  assert.match(comment, /^: x-niyatnaroute-provider=openai/m);
  assert.match(comment, /^: x-niyatnaroute-model=gpt-4o-mini/m);
  assert.match(comment, /^: x-niyatnaroute-tokens-in=4/m);
  assert.match(comment, /^: x-niyatnaroute-tokens-out=2/m);
  assert.match(comment, /^: x-niyatnaroute-response-cost=0\.0000000000/m);
});

test("buildNiyatnaRouteResponseMetaHeaders emits X-NiyatnaRoute-Cost-Saved only when costSavedUsd is provided", () => {
  // Cache HIT: the incremental cost of serving the hit is 0, but the cache saved the
  // original (would-have-been) cost — surfaced via the Cost-Saved header for analytics.
  const hit = buildNiyatnaRouteResponseMetaHeaders({
    provider: "openai",
    model: "gpt-4o",
    cacheHit: true,
    costUsd: 0,
    costSavedUsd: 0.0125,
  });
  assert.equal(hit[NIYATNAROUTE_RESPONSE_HEADERS.responseCost], "0.0000000000");
  assert.equal(hit[NIYATNAROUTE_RESPONSE_HEADERS.costSaved], "0.0125000000");

  // A normal response (no costSavedUsd) omits the Cost-Saved header entirely.
  const miss = buildNiyatnaRouteResponseMetaHeaders({
    provider: "openai",
    model: "gpt-4o",
    costUsd: 0.0125,
  });
  assert.equal(miss[NIYATNAROUTE_RESPONSE_HEADERS.costSaved], undefined);

  // A free-model HIT still emits Cost-Saved (= 0) — it explicitly passed costSavedUsd.
  const freeHit = buildNiyatnaRouteResponseMetaHeaders({
    cacheHit: true,
    costUsd: 0,
    costSavedUsd: 0,
  });
  assert.equal(freeHit[NIYATNAROUTE_RESPONSE_HEADERS.costSaved], "0.0000000000");
});

test("attachNiyatnaRouteMetaHeaders forwards costSavedUsd onto a Headers bag", () => {
  const headers = new Headers({ "Content-Type": "application/json" });
  attachNiyatnaRouteMetaHeaders(headers, {
    provider: "openai",
    model: "gpt-4o",
    cacheHit: true,
    costUsd: 0,
    costSavedUsd: 0.0125,
  });
  assert.equal(headers.get(NIYATNAROUTE_RESPONSE_HEADERS.responseCost), "0.0000000000");
  assert.equal(headers.get(NIYATNAROUTE_RESPONSE_HEADERS.costSaved), "0.0125000000");
});
