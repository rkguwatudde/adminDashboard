/**
 * Global logger initialization
 * This file should be imported at the very beginning of the app
 * to ensure all console logs are properly handled
 */

import logger from './logger'

// Initialize logger immediately when this module is imported
const initializeLogger = () => {
  // Log initialization (this will be the last log in production)
  if (process.env.NODE_ENV === 'production') {
    // In production, we want to completely disable logging
    // The logger has already disabled console methods
    return
  }

  // In development, show that logger is initialized
  console.log('🔧 Logger initialized for development mode')
  
  // Show current environment
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  
  // Show available logging methods
  console.log('📝 Available logging methods:')
  console.log('  - console.log() - General information')
  console.log('  - console.warn() - Warnings')
  console.log('  - console.error() - Errors')
  console.log('  - console.debug() - Debug information')
  console.log('  - console.info() - Informational messages')
}

// Initialize immediately
initializeLogger()

// Export the logger instance for use throughout the app
export default logger

// Also export a function to reinitialize if needed
export const reinitializeLogger = () => {
  initializeLogger()
}
