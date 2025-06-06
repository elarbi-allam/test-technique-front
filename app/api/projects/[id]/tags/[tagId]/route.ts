import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const { id, tagId } = await params;
    const token = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/projects/${id}/tags/${tagId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // DELETE endpoints might not return content
    return new NextResponse(null, { status: 204 });  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
