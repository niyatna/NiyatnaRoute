import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_NIYATNAROUTE_BASE_URL,
  resolveNiyatnaRouteBaseUrl,
} from "../../src/shared/utils/resolveNiyatnaRouteBaseUrl.ts";

test("resolveNiyatnaRouteBaseUrl prefers NIYATNAROUTE_BASE_URL", () => {
  assert.equal(
    resolveNiyatnaRouteBaseUrl({
      NIYATNAROUTE_BASE_URL: "https://internal.example.com/",
      BASE_URL: "https://base.example.com",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://internal.example.com"
  );
});

test("resolveNiyatnaRouteBaseUrl falls back to BASE_URL", () => {
  assert.equal(
    resolveNiyatnaRouteBaseUrl({
      BASE_URL: "https://base.example.com/",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://base.example.com"
  );
});

test("resolveNiyatnaRouteBaseUrl falls back to NEXT_PUBLIC_BASE_URL", () => {
  assert.equal(
    resolveNiyatnaRouteBaseUrl({
      NEXT_PUBLIC_BASE_URL: "https://public.example.com/",
    }),
    "https://public.example.com"
  );
});

test("resolveNiyatnaRouteBaseUrl ignores blank values", () => {
  assert.equal(
    resolveNiyatnaRouteBaseUrl({
      NIYATNAROUTE_BASE_URL: "   ",
      BASE_URL: "",
      NEXT_PUBLIC_BASE_URL: " https://public.example.com/ ",
    }),
    "https://public.example.com"
  );
});

test("resolveNiyatnaRouteBaseUrl uses the default localhost fallback", () => {
  assert.equal(resolveNiyatnaRouteBaseUrl({}), DEFAULT_NIYATNAROUTE_BASE_URL);
});
