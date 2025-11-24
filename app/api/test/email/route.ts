import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/actions/send-order-email';

/**
 * Test endpoint for email sending (Admin only)
 * Usage: GET /api/test/email?orderCode=6491664591072602
 * 
 * This endpoint allows testing email sending with a real order
 * It will send both customer and admin emails and return detailed results
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get('orderCode');

    if (!orderCode) {
      return NextResponse.json(
        { 
          error: 'Missing orderCode parameter',
          usage: 'GET /api/test/email?orderCode=YOUR_ORDER_CODE'
        },
        { status: 400 }
      );
    }

    console.log(`🧪 [Test Email] Testing email sending for order: ${orderCode}`);

    // Test customer email
    console.log('📧 [Test Email] Testing customer email...');
    const customerEmailResult = await sendOrderConfirmationEmail(orderCode);

    // Test admin email
    console.log('📧 [Test Email] Testing admin email...');
    const adminEmailResult = await sendAdminOrderNotificationEmail(orderCode);

    return NextResponse.json({
      success: true,
      orderCode,
      results: {
        customerEmail: {
          success: customerEmailResult.success,
          messageId: customerEmailResult.messageId || null,
          error: customerEmailResult.error || null,
        },
        adminEmail: {
          success: adminEmailResult.success,
          skipped: adminEmailResult.skipped || false,
          recipients: adminEmailResult.recipients || 0,
          error: adminEmailResult.error || null,
        },
      },
      message: 'Check server logs for detailed debugging information',
    });
  } catch (error) {
    console.error('❌ [Test Email] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

