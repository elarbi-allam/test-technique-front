import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/projects/${id}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
    });
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      return NextResponse.json(
        { message: 'Backend returned invalid JSON' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Extract the members array from the response object
    const members = data.members || [];

    return NextResponse.json(members);
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: 'Backend server is not reachable. Please ensure the backend is running on port 3000.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
