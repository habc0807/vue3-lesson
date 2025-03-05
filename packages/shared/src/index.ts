export function isObject(value: object) {
    return typeof value === 'object' && value !== null;
}

export function isFunction(value: any) {
    return typeof value === 'function'; // todo
}