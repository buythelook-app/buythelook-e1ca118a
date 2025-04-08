
// Simple logging utility to help with debugging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: any;
}

// Default log level - can be adjusted based on environment
const DEFAULT_LOG_LEVEL: LogLevel = 'debug';

// Map log levels to numeric values for comparison
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Current log level - can be changed at runtime
let currentLogLevel: LogLevel = DEFAULT_LOG_LEVEL;

// Set the current log level
export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
};

// Check if a log level should be displayed
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[currentLogLevel];
};

// Format the log message with context
const formatMessage = (message: string, options?: LogOptions): string => {
  if (options?.context) {
    return `[${options.context}] ${message}`;
  }
  return message;
};

// Format object data for logging
const formatData = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
};

// Basic logging functions
export const debug = (message: string, options?: LogOptions) => {
  if (shouldLog('debug')) {
    const formattedMessage = formatMessage(message, options);
    console.debug(formattedMessage);
    if (options?.data) {
      console.debug(formatData(options.data));
    }
  }
};

export const info = (message: string, options?: LogOptions) => {
  if (shouldLog('info')) {
    const formattedMessage = formatMessage(message, options);
    console.info(formattedMessage);
    if (options?.data) {
      console.info(formatData(options.data));
    }
  }
};

export const warn = (message: string, options?: LogOptions) => {
  if (shouldLog('warn')) {
    const formattedMessage = formatMessage(message, options);
    console.warn(formattedMessage);
    if (options?.data) {
      console.warn(formatData(options.data));
    }
  }
};

export const error = (message: string, options?: LogOptions) => {
  if (shouldLog('error')) {
    const formattedMessage = formatMessage(message, options);
    console.error(formattedMessage);
    if (options?.data) {
      console.error(formatData(options.data));
    }
  }
};

// Log group for related logs
export const group = (name: string, fn: () => void) => {
  console.group(name);
  try {
    fn();
  } finally {
    console.groupEnd();
  }
};

// Export a default logger object
const logger = {
  debug,
  info,
  warn,
  error,
  group,
  setLogLevel
};

export default logger;
