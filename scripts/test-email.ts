/**
 * Test script for email sending
 * 
 * Usage:
 *   pnpm tsx scripts/test-email.ts <orderCode>
 * 
 * Example:
 *   pnpm tsx scripts/test-email.ts 6491664591072602
 * 
 * This script tests email sending by calling the test API endpoint
 */

const ORDER_CODE = process.argv[2];

if (!ORDER_CODE) {
  console.error('❌ Error: Order code is required');
  console.log('\nUsage:');
  console.log('  pnpm tsx scripts/test-email.ts <orderCode>');
  console.log('\nExample:');
  console.log('  pnpm tsx scripts/test-email.ts 6491664591072602');
  process.exit(1);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testEmail() {
  try {
    console.log(`🧪 Testing email sending for order: ${ORDER_CODE}`);
    console.log(`📡 Calling: ${BASE_URL}/api/test/email?orderCode=${ORDER_CODE}\n`);

    const response = await fetch(`${BASE_URL}/api/test/email?orderCode=${ORDER_CODE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', data);
      process.exit(1);
    }

    console.log('✅ Test Results:');
    console.log(JSON.stringify(data, null, 2));

    if (data.results.customerEmail.success) {
      console.log('\n✅ Customer email sent successfully!');
      if (data.results.customerEmail.messageId) {
        console.log(`   Message ID: ${data.results.customerEmail.messageId}`);
      }
    } else {
      console.log('\n❌ Customer email failed:');
      console.log(`   Error: ${data.results.customerEmail.error}`);
    }

    if (data.results.adminEmail.success) {
      console.log('\n✅ Admin email sent successfully!');
      console.log(`   Recipients: ${data.results.adminEmail.recipients}`);
    } else if (data.results.adminEmail.skipped) {
      console.log('\n⏭️  Admin email skipped (order not paid yet)');
    } else {
      console.log('\n❌ Admin email failed:');
      console.log(`   Error: ${data.results.adminEmail.error}`);
    }

    console.log('\n📋 Check server logs for detailed debugging information');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEmail();

