import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, upsertUser } from '@/lib/server-db';
import { Profile } from '@campus-connect/types';

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
    return NextResponse.json(db.profiles, {
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

    const profile: Profile = {
      id: body.id || 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      full_name: body.full_name,
      registration_number: (body.registration_number || '').toUpperCase(),
      mobile_number: body.mobile_number,
      college_email: (body.college_email || '').toLowerCase(),
      avatar_url: body.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      department_id: body.department_id || null,
      programme_id: body.programme_id || null,
      admission_year: Number(body.admission_year) || new Date().getFullYear(),
      current_year_of_study: Number(body.current_year_of_study) || 1,
      section: (body.section || 'A').toUpperCase(),
      verification_status: body.verification_status || 'active',
      roles: body.roles && body.roles.length > 0 ? body.roles : ['student'],
      assigned_club_id: body.assigned_club_id !== undefined ? body.assigned_club_id : null,
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = upsertUser(profile);
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
