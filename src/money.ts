/** All game amounts are nonnegative integer cents; formatting never owns game rules. */
export function money(cents: number): string {
  if (!Number.isSafeInteger(cents))
    throw new Error("Money must use integer cents");
  return `$${(cents / 100).toFixed(2)}`;
}
export function compactMoney(cents: number): string {
  if (cents < 10000000) return money(cents);
  return `$${(cents / 100000000).toFixed(2)}m`;
}
export function parseAmount(input: string): number | null {
  if (!/^\d+(\.\d{0,2})?$/.test(input.trim())) return null;
  const [whole = "0", fraction = ""] = input.trim().split(".");
  const n = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(n) ? n : null;
}
