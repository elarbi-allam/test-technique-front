import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
      const response = await fetch(`${BACKEND_URL}/ai/suggest-tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Invalid JSON response from backend:', jsonError);
      return NextResponse.json(
        { message: 'Invalid response from server' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI suggest tags proxy error:', error);
    
    // Handle network errors (backend unreachable)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: 'Unable to connect to backend service' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
