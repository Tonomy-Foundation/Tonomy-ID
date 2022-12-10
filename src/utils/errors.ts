export class ApplicationError extends Error {
    code: ApplicationErrors;

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

export function throwError(message: string, code?: ApplicationErrors) {
    let error = new ApplicationError(message);
    if (code) {
        error = new ApplicationError(code + ': ' + message);
    }
    throw error;
}

enum ApplicationErrors {
    UsernameTaken = 'UsernameTaken',
    NoKeyFound = 'NoKeyFound',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ApplicationErrors {
    /*
     * Returns the index of the enum value
     *
     * @param value The value to get the index of
     */
    export function indexFor(value: ApplicationErrors): number {
        return Object.keys(ApplicationErrors).indexOf(value);
    }

    /*
     * Creates an ApplicationErrors from a string or index of the level
     *
     * @param value The string or index
     */
    export function from(value: number | string): ApplicationErrors {
        let index: number;
        if (typeof value !== 'number') {
            index = ApplicationErrors.indexFor(value as ApplicationErrors);
        } else {
            index = value;
        }
        return Object.values(ApplicationErrors)[index] as ApplicationErrors;
    }
}

export { ApplicationErrors };
