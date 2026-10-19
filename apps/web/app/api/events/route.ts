import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, updateEvent, updateEventStatus, upsertEvent } from '@/lib/server-db';
import { EventItem } from '@campus-connect/types';

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
    const status = searchParams.get('status');

    let events = db.events;
    if (status) {
      events = events.filter((e) => e.status === status);
    }

    return NextResponse.json(events, {
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

    // Check if this is an event edit
    if (body.action === 'edit_event' && body.id && body.updates) {
      if (!body.updates.poster_url && body.updates.poster_url !== undefined) {
        return NextResponse.json({ error: 'An official event poster image is mandatory.' }, {
          status: 400,
          headers: CORS_HEADERS,
        });
      }
      const updated = updateEvent(body.id, body.updates, body.actor || 'Authorized Coordinator');
      if (!updated) {
        return NextResponse.json({ error: 'Event not found' }, {
          status: 404,
          headers: CORS_HEADERS,
        });
      }
      return NextResponse.json(updated, {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // Check if this is a status update or full event upsert
    if (body.action === 'update_status' && body.id && body.status) {
      const updated = updateEventStatus(body.id, body.status, body.rejection_reason);
      if (!updated) {
        return NextResponse.json({ error: 'Event not found' }, {
          status: 404,
          headers: CORS_HEADERS,
        });
      }
      return NextResponse.json(updated, {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    if (!body.poster_url || !body.poster_url.trim()) {
      return NextResponse.json({ error: 'An official event poster image is mandatory for all campus events.' }, {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const event: EventItem = {
      id: body.id || 'e-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: body.title,
      description: body.description || '',
      category: body.category || 'General',
      organizing_type: body.organizing_type || 'club',
      club_id: body.club_id || null,
      department_id: body.department_id || null,
      venue: body.venue,
      start_date: body.start_date,
      end_date: body.end_date,
      registration_deadline: body.registration_deadline,
      max_participants: Number(body.max_participants) || 100,
      current_registrations: Number(body.current_registrations) || 0,
      contact_info: body.contact_info || { name: 'Organizer', phone: '', email: '' },
      poster_url: body.poster_url,
      status: body.status || 'published',
      created_by: body.created_by || 'system',
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = upsertEvent(event);
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
