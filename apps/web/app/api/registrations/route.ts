import { NextRequest, NextResponse } from 'next/server';
import { addRegistration, cancelRegistration, getDatabase } from '@/lib/server-db';

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

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const userId = searchParams.get('user_id');

    let regs = db.registrations;
    if (eventId) {
      regs = regs.filter((r) => r.event_id === eventId);
    }
    if (userId) {
      regs = regs.filter((r) => r.user_id === userId);
    }

    return NextResponse.json(regs, {
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

    if (body.action === 'cancel' && body.event_id && body.user_id) {
      const res = cancelRegistration(body.event_id, body.user_id);
      return NextResponse.json(res, {
        status: res.success ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    const res = addRegistration(body);
    return NextResponse.json(res, {
      status: res.success ? 201 : 400,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
