import Debug from 'debug';
import { serializeAny } from './strings';

type LogEntry = {
    dateTime: Date;
    namespace: string;
    message: string;
};

export const debugLog: LogEntry[] = [];

const MAX_LOG_ENTRIES = 100;

const DebugAndLog = (namespace: string) => {
    const debug = Debug(namespace);

    return (...args: any[]) => {
        debugLog.push({ dateTime: new Date(), namespace, message: args.map(serializeAny).join(' ') });

        while (debugLog.length > MAX_LOG_ENTRIES) {
            debugLog.shift();
        }

        debug(...args);
    };
};

export default DebugAndLog;
