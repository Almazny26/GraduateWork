type LogDetails = Record<string, unknown> | undefined

// заглушки: консоль должна быть чистой, логи не выводятся
export function logInfo(_scope: string, _message: string, _details?: LogDetails) {}
export function logWarn(_scope: string, _message: string, _details?: LogDetails) {}
export function logError(_scope: string, _message: string, _details?: LogDetails) {}
