import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, upsertAnnouncement } from '@/lib/server-db';
import { Announcement } from '@campus-connect/types';

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
    return NextResponse.json(db.announcements, {
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
    const db = getDatabase();

    // Enforce faculty or admin authorization
    if (body.author_id) {
      const author = db.profiles.find((p) => p.id === body.author_id);
      if (author && !author.roles?.includes('admin') && !author.roles?.includes('faculty')) {
        return NextResponse.json(
          { error: 'Forbidden: Only faculty members and administrators can publish announcements.' },
          { status: 403, headers: CORS_HEADERS }
        );
      }
    }

    const ann: Announcement = {
      id: body.id || 'a-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: body.title,
      content: body.content,
      category: body.category || 'General',
      priority: body.priority || 'medium',
      is_mandatory: Boolean(body.is_mandatory),
      target_scope: body.target_scope || 'campus',
      target_department_id: body.target_department_id || null,
      target_programme_id: body.target_programme_id || null,
      target_admission_year: body.target_admission_year || (body.target_batch ? Number(body.target_batch) : null),
      target_section: body.target_section || null,
      author_id: body.author_id || 'system',
      created_at: body.created_at || new Date().toISOString(),
    };

    const saved = upsertAnnouncement(ann);
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
