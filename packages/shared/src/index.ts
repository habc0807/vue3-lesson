export function isObject(value: object) {
    return typeof value === 'object' && value !== null;
}

export function isfunction(value: any) {
    return typeof value === 'function'; // todo
}