declare type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | string;

const LOG_LOVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

export { type LogLevel, LOG_LOVELS };
