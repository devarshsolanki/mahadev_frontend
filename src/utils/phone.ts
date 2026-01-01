// Simple E.164 normalization utility
// - If input starts with '+', assume it's already E.164 and return normalized digits
// - If input is digits only and length looks like national number, prepend default country code
// - Removes common separators (spaces, dashes, parentheses)

export function toE164(input: string, defaultCountryCode = '91'): string {
  if (!input) return '';
  // Remove spaces, dashes, parentheses
  const cleaned = input.replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+')) {
    // Ensure plus followed by digits
    return cleaned;
  }

  // If the number already includes country code without + (e.g., 919876543210)
  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  // Fallback: prepend default country code
  const onlyDigits = cleaned.replace(/\D/g, '');
  return `+${defaultCountryCode}${onlyDigits}`;
}

export default toE164;
