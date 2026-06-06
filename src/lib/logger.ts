type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

function log(level: LogLevel, message: string, data?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data !== undefined ? { data } : {}),
  };

  if (process.env.NODE_ENV === "production") {
    // Production: structured JSON logs (for Vercel, Datadog etc.)
    console[level === "error" ? "error" : "log"](JSON.stringify(entry));
  } else {
    // Development: readable colored logs
    const colors = {
      info: "\x1b[36m", // cyan
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
      debug: "\x1b[35m", // magenta
    };
    const reset = "\x1b[0m";
    console[level === "error" ? "error" : "log"](
      `${colors[level]}[${level.toUpperCase()}]${reset} ${entry.timestamp} — ${message}`,
      data ? data : "",
    );
  }
}

export const logger = {
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
  debug: (message: string, data?: unknown) => log("debug", message, data),
};
