#!/usr/bin/env bun

/**
 * Test script to verify Twilio SMS configuration
 * Usage: bun run scripts/test-twilio-sms.ts +1234567890
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const testPhoneNumber = process.argv[2];

if (!testPhoneNumber) {
  console.error('Usage: bun run scripts/test-twilio-sms.ts +1234567890');
  process.exit(1);
}

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error('Missing Twilio environment variables');
  console.error('Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
  process.exit(1);
}

async function testSMS() {
  console.log('Testing Twilio SMS configuration...\n');
  console.log('From:', TWILIO_PHONE_NUMBER);
  console.log('To:', testPhoneNumber);
  console.log('Account SID:', TWILIO_ACCOUNT_SID);
  console.log('\nSending test message...\n');

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER,
        To: testPhoneNumber,
        Body: 'Test message from Tatlist - Twilio SMS is configured correctly!',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send SMS:');
      console.error(JSON.stringify(error, null, 2));
      process.exit(1);
    }

    const data = await response.json();
    console.log('✅ SMS sent successfully!');
    console.log('\nMessage Details:');
    console.log('- SID:', data.sid);
    console.log('- Status:', data.status);
    console.log('- Price:', data.price || 'Pending');
    console.log('- Date Created:', data.date_created);
    console.log('\nCheck your phone for the test message!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSMS();
