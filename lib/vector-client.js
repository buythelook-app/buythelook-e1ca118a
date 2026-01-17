const VECTOR_SERVER_URL = process.env.NEXT_PUBLIC_VECTOR_SERVER_URL || 'http://localhost:4000';

export async function searchProductsViaVector({ queries, priceRanges, occasion, colors, limit = 40 }) {
  const response = await fetch(`${VECTOR_SERVER_URL}/api/search/multi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queries,
      priceRanges,
      occasion, // NEW - pass occasion to server
      colors,
      limit,
    }),
  });

  const data = await response.json();
  return data.products;
}