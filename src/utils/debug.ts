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
        debugLog.push({ dateTime: new Date(), namespace, message: args.map((x) => serializeAny(x, true)).join(' ') });

        while (debugLog.length > MAX_LOG_ENTRIES) {
            debugLog.shift();
        }

        debug(...args);
    };
};

DebugAndLog.enable = Debug.enable;
DebugAndLog.enabled = Debug.enabled;
DebugAndLog.log = Debug.log;
DebugAndLog.formatArgs = Debug.formatArgs;
DebugAndLog.save = Debug.save;
DebugAndLog.load = Debug.load;
DebugAndLog.useColors = Debug.useColors;
DebugAndLog.colors = Debug.colors;
DebugAndLog.disable = Debug.disable;
DebugAndLog.disabled = Debug.disabled;
DebugAndLog.storage = Debug.storage;
DebugAndLog.destroy = Debug.destroy;

export default DebugAndLog;
