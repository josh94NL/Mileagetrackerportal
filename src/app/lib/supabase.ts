import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// API helper function
export async function apiRequest(
  endpoint: string, 
  options: RequestInit = {}
) {
  const url = `${supabaseUrl}/functions/v1/make-server-7770b39e${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  console.log('API Request:', {
    url,
    method: options.method || 'GET',
    headers: {
      ...headers,
      Authorization: headers.Authorization ? 'Bearer [REDACTED]' : 'MISSING'
    }
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`API request failed: ${url}`, {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return { error: data.error || `Request failed: ${response.status}` };
    }

    return data;
  } catch (error) {
    console.error(`API request exception: ${url}`, error);
    return { 
      error: error instanceof Error 
        ? `Network error: ${error.message}` 
        : 'Network error: Unable to connect to server. Please ensure the Supabase Edge Function is deployed.' 
    };
  }
}