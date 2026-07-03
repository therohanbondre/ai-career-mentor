import type { ApiHealthResponse } from '@/types';

export async function GET(): Promise<Response> {
  const payload: ApiHealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  return Response.json(payload);
}
