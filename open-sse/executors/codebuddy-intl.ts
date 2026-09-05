import { CodeBuddyCnExecutor } from "./codebuddy-cn.ts";
import type { ProviderCredentials } from "./base.ts";

/**
 * CodeBuddyIntlExecutor — talks to https://www.codebuddy.ai/v2/chat/completions
 *
 * Inherits all Tencent CodeBuddy streaming, sensitive-prompt neutralization,
 * and compact tool-description handling from CodeBuddyCnExecutor while scoped
 * to the "codebuddy-intl" provider.
 *
 * CodeBuddy Intl strictly enforces:
 * 1. Leading system prompt as messages[0] (code 11128 "first message is not system prompt").
 * 2. User content formatted as typed blocks [{ type: "text", text: content }].
 * 3. Stream: true required.
 * 4. Model tier alias translation: fast -> fast-model, balanced -> balanced-model,
 *    primary -> primary-model, ultimate -> deep-model.
 */
export class CodeBuddyIntlExecutor extends CodeBuddyCnExecutor {
  constructor() {
    super("codebuddy-intl");
  }

  transformRequest(
    model: string,
    body: unknown,
    stream: boolean,
    credentials: ProviderCredentials
  ): unknown {
    const transformed = super.transformRequest(model, body, stream, credentials);
    if (!transformed || typeof transformed !== "object" || Array.isArray(transformed)) {
      return transformed;
    }
    const out = transformed as Record<string, unknown>;
    out.stream = true;

    const eff = out.reasoning_effort;
    if (eff === "none" || eff === "off") {
      delete out.reasoning_effort;
    } else if (eff) {
      out.reasoning_summary = "auto";
    }

    // Model alias translation for virtual tier models (Fast, Balanced, Primary, Ultimate)
    const modelStr = String(out.model || model || "").toLowerCase();
    if (modelStr === "fast") out.model = "fast-model";
    else if (modelStr === "balanced") out.model = "balanced-model";
    else if (modelStr === "primary") out.model = "primary-model";
    else if (modelStr === "ultimate") out.model = "deep-model";

    // CodeBuddy strictly requires:
    // 1) Leading system prompt as messages[0]
    // 2) User content as typed blocks [{ type: "text", text: ... }], not bare string
    const source = Array.isArray(out.messages) ? out.messages : [];
    const newMessages: Array<Record<string, unknown>> = [
      { role: "system", content: "You are CodeBuddy Code." },
    ];
    for (const message of source) {
      if (!message || typeof message !== "object") continue;
      const msg = message as Record<string, unknown>;
      if (["system", "developer"].includes(String(msg.role))) continue;
      if (msg.role === "user" && typeof msg.content === "string") {
        newMessages.push({ ...msg, content: [{ type: "text", text: msg.content }] });
      } else {
        newMessages.push({ ...msg });
      }
    }
    out.messages = newMessages;

    return out;
  }
}

export default CodeBuddyIntlExecutor;

