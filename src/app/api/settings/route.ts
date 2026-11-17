import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/services/settings.service';
import { settingsSchema } from '@/lib/validations';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = settingsSchema.parse(body);
    const updated = await updateSettings(validated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

