import { cookies } from 'next/headers';
import { ApiResponse } from '@/lib/api-response';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('portfolio_auth_token');
    return ApiResponse.success({}, 'Logged out successfully');
  } catch (err: any) {
    console.error('Logout error:', err);
    return ApiResponse.serverError('Failed to logout');
  }
}
