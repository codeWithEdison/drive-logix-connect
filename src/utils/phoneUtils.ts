/**
 * Phone number utility functions for Rwandan phone numbers
 * Used for Paypack mobile money payment integration
 */

/**
 * Format Rwandan phone number to international format (+250XXXXXXXXX)
 * @param phone - Phone number in any format
 * @returns Formatted phone number with +250 prefix
 */
export function formatRwandanPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // If it starts with 250, add +
  if (cleaned.startsWith("250")) {
    return `+${cleaned}`;
  }

  // If it starts with 0, replace with +250
  if (cleaned.startsWith("0")) {
    return `+250${cleaned.substring(1)}`;
  }

  // If it's 9 digits, add +250 prefix
  if (cleaned.length === 9) {
    return `+250${cleaned}`;
  }

  // If it already has +, return as is
  return phone.startsWith("+") ? phone : `+${phone}`;
}

/**
 * Validate Rwandan phone number format
 * @param phone - Phone number to validate
 * @returns true if valid Rwandan phone number format
 */
export function isValidRwandanPhone(phone: string): boolean {
  // Valid format: +250XXXXXXXXX (13 characters total)
  return /^\+250[0-9]{9}$/.test(phone);
}

/**
 * Format phone number for display (with spaces for readability)
 * @param phone - Phone number in +250XXXXXXXXX format
 * @returns Formatted phone number with spaces: +250 XXX XXX XXX
 */
export function displayRwandanPhone(phone: string): string {
  const formatted = formatRwandanPhone(phone);

  if (isValidRwandanPhone(formatted)) {
    // Format as: +250 XXX XXX XXX
    return formatted.replace(/(\+250)(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
  }

  return phone;
}

/**
 * Get phone validation error message
 * @param phone - Phone number to validate
 * @returns Error message if invalid, null if valid
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone || phone.trim() === "") {
    return "Phone number is required";
  }

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length < 9) {
    return "Phone number is too short";
  }

  if (cleaned.length > 12) {
    return "Phone number is too long";
  }

  const formatted = formatRwandanPhone(phone);

  if (!isValidRwandanPhone(formatted)) {
    return "Invalid Rwandan phone number. Format: +250XXXXXXXXX";
  }

  return null;
}

/**
 * Extract the mobile operator from a Rwandan phone number
 * @param phone - Phone number in any format
 * @returns Operator name (MTN, Airtel) or null if cannot determine
 */
export function getRwandanOperator(phone: string): "MTN" | "Airtel" | null {
  const formatted = formatRwandanPhone(phone);

  if (!isValidRwandanPhone(formatted)) {
    return null;
  }

  // Extract the first 3 digits after +250
  const prefix = formatted.substring(4, 7);

  // MTN prefixes: 078, 079
  if (prefix.startsWith("078") || prefix.startsWith("079")) {
    return "MTN";
  }

  // Airtel prefixes: 073, 072
  if (prefix.startsWith("073") || prefix.startsWith("072")) {
    return "Airtel";
  }

  return null;
}
