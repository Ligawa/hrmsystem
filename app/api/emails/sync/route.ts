import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * This endpoint manually syncs emails from the database.
 * In production, you could extend this to fetch from Resend's API
 * and sync received emails automatically.
 */

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Count emails in database
    const { count, error: countError } = await supabase
      .from('email_inbox')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('[v0] Error counting emails:', countError);
      throw countError;
    }

    console.log('[v0] Sync completed. Total emails:', count);

    return NextResponse.json({
      success: true,
      message: 'Email sync completed',
      emailCount: count || 0,
    });
  } catch (error) {
    console.error('[v0] Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Health check - verify email inbox is accessible
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { count, error: countError } = await supabase
      .from('email_inbox')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: countError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      emailCount: count || 0,
      message: 'Email service is operational',
    });
  } catch (error) {
    console.error('[v0] Health check error:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
