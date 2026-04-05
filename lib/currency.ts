export function formatPrice(priceInINR: number, country?: string): string {
  if (country && country !== 'India' && country !== 'IN') {
    // Rough conversion for international users
    const priceInUSD = Math.ceil(priceInINR / 83);
    return `$${priceInUSD}`;
  }
  return `₹${priceInINR}`;
}
