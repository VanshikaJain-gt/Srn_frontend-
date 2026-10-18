/**
 * Fee shown to people. A fee of 0 (or no fee) is a free registration, so it is
 * always shown as "Free", never as "₹0".
 */
export function formatFee(
  value?: number | string | null,
  options: { decimals?: boolean } = {}
): string {
  const amount = Number(value);

  if (value == null || value === "" || !Number.isFinite(amount) || amount === 0) {
    return "Free";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: options.decimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
