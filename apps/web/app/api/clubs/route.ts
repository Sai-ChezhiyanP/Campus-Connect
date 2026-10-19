import { NextRequest, NextResponse } from 'next/server';
import { deleteClub, getDatabase, upsertClub } from '@/lib/server-db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json(db.clubs, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Club name is required' }, {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const saved = upsertClub(body);
    return NextResponse.json(saved, {
      status: 201,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Club ID is required' }, {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const success = deleteClub(id);
    if (!success) {
      return NextResponse.json({ error: 'Club not found' }, {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    return NextResponse.json({ success: true }, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
