import { NextRequest, NextResponse } from 'next/server';
import { boxnowService } from '@/lib/services/boxnow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { lockerId, orderId, customerName, customerPhone, customerEmail, compartmentSize, originLocationId } = body;

    if (!lockerId || !orderId || !customerName || !customerPhone || !customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const result = await boxnowService.createDeliveryRequest({
      lockerId,
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      compartmentSize: compartmentSize || 2, // 1=small, 2=medium, 3=large
      originLocationId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in BOXNOW shipments API route:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create delivery request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

