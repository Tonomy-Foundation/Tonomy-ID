import Debug from 'debug';

const originalConsoleError = console.error;

// Use the output same stream as console.debug (stdout) instead of default (stderr)
Debug.log = console.debug.bind(console);

const debug = Debug('tonomy-console:use debug() instead of console.log():');

// Overload console.log to use debug
console.log = (...args) => {
    if (debug.enabled) {
        debug(...args);
    } else {
        console.warn('Use debug() instead of console.log()', ...args);
    }
};

// Ensure console.error retains its default behavior
console.error = originalConsoleError;
