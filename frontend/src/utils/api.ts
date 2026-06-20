/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Helper to fetch places, falling back to local mocks if backend is offline.
 */
export async function fetchPlaces(category?: string, fallbackData?: any[]) {
  try {
    const url = category 
      ? `${API_BASE_URL}/places/?category=${category}` 
      : `${API_BASE_URL}/places/`;
      
    const res = await fetch(url);
    if (!res.ok) throw new Error('Backend returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, using local mock fallback for places query.', err);
    if (category && fallbackData) {
      return fallbackData.filter((loc: any) => loc.category === category);
    }
    return fallbackData;
  }
}

/**
 * Helper to fetch AI recommendations.
 */
export async function fetchRecommendations(profile: string, category?: string) {
  try {
    let url = `${API_BASE_URL}/places/recommendations?profile=${profile}`;
    if (category) url += `&category=${category}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, recommendations falling back to mock generator.', err);
    return null;
  }
}

/**
 * Uploads an image to the Vision AI Analyzer.
 */
export async function uploadToVisionAI(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/cv/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Vision analysis failed');
  }

  return await res.json();
}

/**
 * Uploads an image to verify a specific place.
 */
export async function uploadPlaceVerification(placeId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/reports/place/${placeId}/verify`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Audit verification failed');
  }

  return await res.json();
}

/**
 * Submits a community review.
 */
export async function submitReview(placeId: number, author: string, rating: number, comment: string) {
  const res = await fetch(`${API_BASE_URL}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      place_id: placeId,
      author,
      rating,
      comment,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to submit review');
  }

  return await res.json();
}
