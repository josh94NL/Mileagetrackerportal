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
  
  // Extract caller-provided Authorization (contains user's access_token)
  const callerHeaders = (options.headers || {}) as Record<string, string>;
  const callerAuth = callerHeaders['Authorization'] || callerHeaders['authorization'] || '';
  // Strip "Bearer " prefix to get the raw token
  const userToken = callerAuth.replace(/^Bearer\s+/i, '');

  // Build headers:
  // - 'Authorization' always carries the anon key so the Supabase Edge Function gateway accepts it
  // - 'apikey' is the same anon key (belt-and-suspenders for the gateway)
  // - 'X-User-Token' carries the real user access_token for our Hono server to verify
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
    'Authorization': `Bearer ${publicAnonKey}`,
  };

  // Only attach X-User-Token when we actually have a user token (not the anon key itself)
  if (userToken && userToken !== publicAnonKey) {
    headers['X-User-Token'] = userToken;
  }

  console.log('=== API REQUEST ===');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Has user token:', userToken && userToken !== publicAnonKey ? 'YES' : 'NO');

  try {
    // Build fetch options, excluding the original headers (we built our own)
    const { headers: _discardedHeaders, ...restOptions } = options as any;
    
    const response = await fetch(url, {
      ...restOptions,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('API request failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        data
      });
      return { error: data.error || data.msg || data.message || `Request failed: ${response.status}` };
    }

    console.log('API request success');
    return data;
  } catch (error) {
    console.error('API request exception:', error);
    return { 
      error: error instanceof Error 
        ? `Network error: ${error.message}` 
        : 'Network error: Unable to connect to server.' 
    };
  }
}