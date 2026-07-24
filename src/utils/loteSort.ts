export function getLoteSortKey(loteStr: string) {
    if (!loteStr) return { prefix: "", num: 0, hasSub: false, subIsNum: false, subNum: 0, subStr: "" };
    
    const parts = loteStr.trim().split("-");
    const prefix = parts[0] ? parts[0].toUpperCase() : "";
    const num = parts[1] ? parseInt(parts[1], 10) || 0 : 0;
    
    let subIsNum = false;
    let subNum = 0;
    let subStr = "";
    const hasSub = parts.length > 2;
    
    if (hasSub) {
        const subVal = parts[2].trim();
        const parsed = parseInt(subVal, 10);
        if (!isNaN(parsed) && String(parsed) === subVal) {
            subIsNum = true;
            subNum = parsed;
        } else {
            subStr = subVal.toUpperCase();
        }
    }
    
    return { prefix, num, hasSub, subIsNum, subNum, subStr };
}

export function compareLotes(aStr: string, bStr: string): number {
    const a = getLoteSortKey(aStr);
    const b = getLoteSortKey(bStr);

    // Rule 1: Prefix alphabetical (A, B, C...)
    if (a.prefix !== b.prefix) {
        return a.prefix.localeCompare(b.prefix, undefined, { numeric: true });
    }

    // Rule 2: Main number numeric (1, 2, ..., 10)
    if (a.num !== b.num) {
        return a.num - b.num;
    }

    // Rule 3: Third segment if present
    if (!a.hasSub && !b.hasSub) return 0;
    if (!a.hasSub && b.hasSub) return -1;
    if (a.hasSub && !b.hasSub) return 1;

    if (a.subIsNum && b.subIsNum) {
        return a.subNum - b.subNum;
    }
    if (a.subIsNum && !b.subIsNum) {
        return -1;
    }
    if (!a.subIsNum && b.subIsNum) {
        return 1;
    }

    return a.subStr.localeCompare(b.subStr, undefined, { numeric: true });
}

export function sortParcelasByLote<T extends { id: string }>(parcelas: T[]): T[] {
    return [...parcelas].sort((a, b) => compareLotes(a.id, b.id));
}
