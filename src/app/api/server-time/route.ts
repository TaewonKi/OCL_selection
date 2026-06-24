import { NextResponse } from 'next/server';

// Provides a lightweight authoritative timestamp sourced from the server runtime.
export function GET() {
  return NextResponse.json(
    { now: Date.now() },
    {
      headers: {
        'Cache-Control': 'public, max-age=1',
      },
    },
  );
}
