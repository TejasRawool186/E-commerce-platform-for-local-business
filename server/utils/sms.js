const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

if (accountSid && authToken && twilioPhoneNumber) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials not configured. SMS notifications will be disabled.');
}

const sendSMS = async (to, message) => {
  if (!client) {
    console.log('SMS would have been sent to', to, ':', message);
    return { success: false, message: 'Twilio not configured' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('SMS sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
