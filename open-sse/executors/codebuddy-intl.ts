import { CodeBuddyCnExecutor } from "./codebuddy-cn.ts";

/**
 * CodeBuddyIntlExecutor — talks to https://www.codebuddy.ai/v2/chat/completions
 *
 * Inherits all Tencent CodeBuddy streaming, sensitive-prompt neutralization,
 * and compact tool-description handling from CodeBuddyCnExecutor while scoped
 * to the "codebuddy-intl" provider.
 */
export class CodeBuddyIntlExecutor extends CodeBuddyCnExecutor {
  constructor() {
    super("codebuddy-intl");
  }
}

export default CodeBuddyIntlExecutor;
