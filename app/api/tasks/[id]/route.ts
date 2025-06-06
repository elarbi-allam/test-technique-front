import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const token = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),    });

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

    return NextResponse.json(data);
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: 'Backend server is not reachable. Please ensure the backend is running.' },
        { status: 503 }
      );
    }
    
    console.error('Task PATCH proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },    });

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

    return NextResponse.json(data);
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: 'Backend server is not reachable. Please ensure the backend is running.' },
        { status: 503 }
      );
    }
    
    console.error('Task DELETE proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
            { status: 500 }
    );
  }
}
