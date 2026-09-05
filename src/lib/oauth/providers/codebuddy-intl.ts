import { CODEBUDDY_INTL_CONFIG } from "../constants/oauth";

/**
 * CodeBuddy International (Tencent — codebuddy.ai) — custom device-auth flow.
 *
 *   1. POST stateUrl?platform=ide → { code: 0, data: { state, authUrl } }
 *   2. Open authUrl in the browser
 *   3. GET tokenUrl?state=<state> until { code: 0, data.accessToken } (11217 = pending)
 */
type CodeBuddyConfig = typeof CODEBUDDY_INTL_CONFIG;

interface CodeBuddyDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

interface CodeBuddyTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

interface CodeBuddyPollResult {
  ok: boolean;
  data: Record<string, unknown> | CodeBuddyTokens;
}

export const codebuddyIntl = {
  config: CODEBUDDY_INTL_CONFIG,
  flowType: "device_code" as const,

  requestDeviceCode: async (config: CodeBuddyConfig): Promise<CodeBuddyDeviceCodeResponse> => {
    const stateUrl = `${config.stateUrl}?platform=${encodeURIComponent(config.platform)}`;
    const response = await fetch(stateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": config.userAgent,
        "X-Requested-With": "XMLHttpRequest",
        "X-Domain": "www.codebuddy.ai",
        "X-No-Authorization": "true",
        "X-No-User-Id": "true",
        "X-Product": "SaaS",
      },
      body: JSON.stringify({ platform: config.platform }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`CodeBuddy Intl state request failed (${response.status})`);
    }

    const json = (await response.json()) as { code?: number; data?: any; msg?: string };
    if (json.code !== 0 || !json.data?.state) {
      throw new Error(`CodeBuddy Intl state error: ${json.msg || "no state in response"}`);
    }

    const state = String(json.data.state);
    const authUrl = String(json.data.authUrl || json.data.url || "");
    return {
      device_code: state,
      user_code: state,
      verification_uri: authUrl,
      verification_uri_complete: authUrl,
      expires_in: 600,
      interval: Math.max(1, Math.floor((config.pollInterval || 5000) / 1000)),
    };
  },

  pollToken: async (config: CodeBuddyConfig, deviceCode: string): Promise<CodeBuddyPollResult> => {
    const response = await fetch(
      `${config.tokenUrl}?state=${encodeURIComponent(deviceCode)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": config.userAgent,
          "X-Requested-With": "XMLHttpRequest",
          "X-Domain": "www.codebuddy.ai",
          "X-No-Authorization": "true",
          "X-No-User-Id": "true",
          "X-No-Enterprise-Id": "true",
          "X-No-Department-Info": "true",
          "X-Product": "SaaS",
        },
      }
    );
    if (!response.ok) return { ok: false, data: { error: "request_failed" } };
    const data = (await response.json()) as { code?: number; data?: any; msg?: string };
    // code 11217 = pending (RetryFetchToken / login ing...), code 0 = success
    if (data.code === 0 && data.data?.accessToken) {
      return {
        ok: true,
        data: {
          access_token: data.data.accessToken,
          refresh_token: data.data.refreshToken || "",
          token_type: data.data.tokenType || "Bearer",
          expires_in: data.data.expiresIn,
        },
      };
    }
    if (data.code === 11217 || data.msg?.includes("login ing") || data.msg?.includes("RetryFetchToken")) {
      return { ok: true, data: { error: "authorization_pending" } };
    }
    return { ok: false, data: { error: data.msg || "auth_failed", code: data.code, msg: data.msg } };
  },

  mapTokens: (tokens: CodeBuddyTokens) => ({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in || 86400,
    providerSpecificData: {},
  }),
};

export default codebuddyIntl;
