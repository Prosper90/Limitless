// frontend/src/utils/formatUtils.ts

export const formatCurrency = (
  value: string | number | undefined,
  options?: {
    currencySymbol?: string;
    precision?: number;
    abbreviate?: boolean;
    scientificNotationThreshold?: number; // e.g., 0.000001 for 1e-6
  }
): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return options?.currencySymbol !== undefined
      ? `${options.currencySymbol}0.00`
      : '$0.00';
  }

  const num = Number(value);
  const currencySymbol = options?.currencySymbol ?? '$';
  const precision = options?.precision ?? 2;
  const abbreviate = options?.abbreviate ?? true;
  // Default threshold for scientific notation - catches very small numbers
  const scientificNotationThreshold = options?.scientificNotationThreshold ?? 1e-6;

  // Handle actual zero
  if (num === 0) {
    return `${currencySymbol}0.00`;
  }

  // Handle very small non-zero numbers with scientific notation
  // Must be checked before other formatting to catch tiny values like 2.75e-15
  if (Math.abs(num) > 0 && Math.abs(num) < scientificNotationThreshold) {
    // For very small numbers, use cleaner scientific notation (2-4 significant digits)
    const expPrecision = Math.min(precision, 4);
    return `${currencySymbol}${num.toExponential(expPrecision)}`;
  }

  // Handle large numbers with abbreviation
  if (abbreviate) {
    if (Math.abs(num) >= 1e12) return `${currencySymbol}${(num / 1e12).toFixed(precision)}T`;
    if (Math.abs(num) >= 1e9) return `${currencySymbol}${(num / 1e9).toFixed(precision)}B`;
    if (Math.abs(num) >= 1e6) return `${currencySymbol}${(num / 1e6).toFixed(precision)}M`;
    if (Math.abs(num) >= 1e3) return `${currencySymbol}${(num / 1e3).toFixed(precision)}K`;
  }

  // For numbers between scientificNotationThreshold and 1 (non-abbreviated)
  if (Math.abs(num) < 1) {
    return `${currencySymbol}${num.toFixed(Math.max(precision, 6))}`;
  }

  // All other numbers (>= 1 and not abbreviated)
  return `${currencySymbol}${num.toFixed(precision)}`;
};

/**
 * Format floor price with scientific notation for very small values
 * Designed specifically for the backing/MAX_SUPPLY calculation which yields
 * extremely small numbers like 2.75e-15
 */
export const formatFloorPrice = (
  value: number | undefined,
  currencySymbol: string = '$'
): string => {
  if (value === undefined || value === null || isNaN(value) || value === 0) {
    return `${currencySymbol}0.00`;
  }

  // For very small numbers (< 0.000001), use scientific notation
  if (Math.abs(value) < 1e-6) {
    // Format as "2.75e-15" with 2-4 significant digits
    const formatted = value.toExponential(2);
    return `${currencySymbol}${formatted}`;
  }

  // For small numbers (< 1), show more decimals
  if (Math.abs(value) < 1) {
    return `${currencySymbol}${value.toFixed(8)}`;
  }

  // Normal numbers
  return `${currencySymbol}${value.toFixed(4)}`;
};
