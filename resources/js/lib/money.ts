/** Amounts are stored as whole cents: 2500000 → "LKR 25,000". */
export function lkr(cents: number, withCents = false) {
    const rupees = cents / 100;
    return `LKR ${rupees.toLocaleString('en-LK', { minimumFractionDigits: withCents ? 2 : 0, maximumFractionDigits: withCents ? 2 : 0 })}`;
}
