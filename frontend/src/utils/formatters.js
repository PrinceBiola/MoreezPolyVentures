export const formatNumber = (val) => {
  if (val === undefined || val === null || val === '') return '';
  // Ensure we are working with a string and remove existing commas
  const str = val.toString().replace(/,/g, '');
  const parts = str.split('.');
  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
};

export const parseNumber = (val) => {
  if (!val) return '';
  // Remove everything except numbers and a single decimal point
  const cleaned = val.toString().replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};
