const LOG_PREFIX = '[SkyFitnessPro]'

type LogDetails = Record<string, unknown> | undefined

// просто обёртки над console чтобы везде один префикс и удобно искать в консоли
export function logInfo(scope: string, message: string, details?: LogDetails) {
  if (details) {
    console.info(`${LOG_PREFIX} ${scope}: ${message}`, details)
    return
  }
  console.info(`${LOG_PREFIX} ${scope}: ${message}`)
}

export function logWarn(scope: string, message: string, details?: LogDetails) {
  if (details) {
    console.warn(`${LOG_PREFIX} ${scope}: ${message}`, details)
    return
  }
  console.warn(`${LOG_PREFIX} ${scope}: ${message}`)
}

export function logError(scope: string, message: string, details?: LogDetails) {
  if (details) {
    console.error(`${LOG_PREFIX} ${scope}: ${message}`, details)
    return
  }
  console.error(`${LOG_PREFIX} ${scope}: ${message}`)
}
