export function formatUsername(value: string) {
    return replaceIllegalCharacters(value);
}

function replaceIllegalCharacters(value: string) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let result = '';

    for (let i = 0; i < value.length; i++) {
        const char = value.charAt(i);

        if (characters.includes(char)) {
            result += char;
        }
    }

    return result;
}
