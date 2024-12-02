import Debug from 'debug';
import { serializeAny } from './strings';

type LogEntry = {
    dateTime: Date;
    namespace: string;
    message: string;
}
export const debugLog: LogEntry[] = [];

const DebugAndLog = (namespace: string) => {
    const debug = Debug(namespace);

    return (...args: any[]) => {
        debugLog.push({ dateTime: new Date(), namespace, message: args.map((arg) => serializeAny(arg)).join(' ') });

        if (debugLog.length > 100) {
            debugLog.shift();
        }

        debug(...args);
    };
};

export default DebugAndLog;
