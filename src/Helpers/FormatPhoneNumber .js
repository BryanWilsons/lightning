export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Keep digits only
  const digits = String(phone).replace(/\D/g, '');

  // Handle US country code (1)
  const number =
    digits.length === 11 && digits.startsWith('1')
      ? digits.slice(1)
      : digits;

  // Format 10-digit US phone numbers
  if (number.length === 10) {
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }

  // Return the original value if it isn't a standard US number
  return phone;
};