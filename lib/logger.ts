/**
 * Production-safe logging utility
 * Disables console logs in production while keeping them in development
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix?: string
}

class Logger {
  private config: LoggerConfig
  private originalConsole: {
    log: typeof console.log
    warn: typeof console.warn
    error: typeof console.error
    debug: typeof console.debug
    info: typeof console.info
  }

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV !== 'production',
      level: 'debug',
      prefix: '[BoraBond]'
    }

    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
      info: console.info.bind(console)
    }

    this.initialize()
  }

  private initialize() {
    if (!this.config.enabled) {
      // Disable all console methods in production
      console.log = () => {}
      console.warn = () => {}
      console.error = () => {}
      console.debug = () => {}
      console.info = () => {}
      
      // Log that logging is disabled (this will be the last log)
      this.originalConsole.log(`${this.config.prefix} Console logging disabled in production`)
    } else {
      // In development, enhance console methods with prefixes
      this.enhanceConsoleMethods()
    }
  }

  private enhanceConsoleMethods() {
    const prefix = this.config.prefix

    console.log = (...args: any[]) => {
      this.originalConsole.log(prefix, ...args)
    }

    console.warn = (...args: any[]) => {
      this.originalConsole.warn(prefix, '⚠️', ...args)
    }

    console.error = (...args: any[]) => {
      this.originalConsole.error(prefix, '❌', ...args)
    }

    console.debug = (...args: any[]) => {
      this.originalConsole.debug(prefix, '🐛', ...args)
    }

    console.info = (...args: any[]) => {
      this.originalConsole.info(prefix, 'ℹ️', ...args)
    }
  }

  // Public methods for controlled logging
  public log(...args: any[]) {
    if (this.config.enabled) {
      this.originalConsole.log(this.config.prefix, ...args)
    }
  }

  public warn(...args: any[]) {
    if (this.config.enabled) {
      this.originalConsole.warn(this.config.prefix, '⚠️', ...args)
    }
  }

  public error(...args: any[]) {
    if (this.config.enabled) {
      this.originalConsole.error(this.config.prefix, '❌', ...args)
    }
  }

  public debug(...args: any[]) {
    if (this.config.enabled) {
      this.originalConsole.debug(this.config.prefix, '🐛', ...args)
    }
  }

  public info(...args: any[]) {
    if (this.config.enabled) {
      this.originalConsole.info(this.config.prefix, 'ℹ️', ...args)
    }
  }

  // Method to restore original console (useful for testing)
  public restore() {
    console.log = this.originalConsole.log
    console.warn = this.originalConsole.warn
    console.error = this.originalConsole.error
    console.debug = this.originalConsole.debug
    console.info = this.originalConsole.info
  }

  // Method to configure logger
  public configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config }
    this.initialize()
  }
}

// Create singleton instance
const logger = new Logger()

// Export both the instance and the class
export default logger
export { Logger, type LogLevel, type LoggerConfig }
