import { DashboardItem } from "@/types/lookTypes";

const PREVIEW_BASE_URL = 'https://preview--ai-bundle-construct-20.lovable.app';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
}

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await fetch(`${PREVIEW_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchPreviewItems = async (): Promise<{ items: DashboardItem[] }> => {
  try {
    const response = await fetch(`${PREVIEW_BASE_URL}/api/items`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching preview items:', error);
    throw error;
  }
};

export const fetchPreviewItem = async (id: string): Promise<DashboardItem> => {
  const response = await fetch(`${PREVIEW_BASE_URL}/api/items/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};