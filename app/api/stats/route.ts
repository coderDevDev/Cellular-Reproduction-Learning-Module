import { NextResponse } from 'next/server';
import { StatsAPI } from '@/lib/api/stats';

export async function GET() {
  try {
    const result = await StatsAPI.getHomepageStats();

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
