export function _uniqueId(idLength: number = 16): string {
    return Math.random().toString(36).substr(2, idLength);
}
