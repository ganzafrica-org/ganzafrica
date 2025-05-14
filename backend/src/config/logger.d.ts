declare class Logger {
    private context;
    constructor(context: string);
    private log;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export default Logger;
//# sourceMappingURL=logger.d.ts.map