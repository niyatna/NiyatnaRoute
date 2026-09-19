import pkg from "../../../package.json" with { type: "json" };

export const APP_CONFIG = {
  name: "NiyatnaRoute",
  description: "High-Performance Enterprise AI Routing Gateway",
  version: pkg.version,
};

export const THEME_CONFIG = {
  storageKey: "theme",
  defaultTheme: "system",
};
