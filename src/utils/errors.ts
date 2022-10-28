class ApplicationError extends Error {
    code: string;

    constructor(message: string) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ExpectedApplicationError extends ApplicationError {
    constructor(message: string) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UnexpectedApplicationError extends ApplicationError {
    constructor(message: string) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}

export function throwExpectedError(message: string, code?: string) {
    const error = new ExpectedApplicationError(message);
    if (code) {
        error.code = code;
    }
    throw error;
}

export function throwUnexpectedError(message: string, code?: string) {
    const error = new UnexpectedApplicationError(message);
    if (code) {
        error.code = code;
    }
    throw error;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function throwUnhandled() {
    await sleep(1000);
    throw new Error('im not handled!');
}

global.onunhandledrejection = function (error) {
    // Warning: when running in "remote debug" mode (JS environment is Chrome browser),
    // this handler is called a second time by Bluebird with a custom "dom-event".
    // We need to filter this case out:
    if (error instanceof Error) {
        console.log('onunhandledrejection()', error.message);
        // TODO log error
        // logError(error);  // Your custom error logging/reporting code
    }
};

/*
List of which files have which error codes, to avoide duplicates:export function throwExpectedError(message: string, code: string) {

TAPP10## = ???
*/
