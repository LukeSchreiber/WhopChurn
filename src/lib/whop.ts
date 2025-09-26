// Whop API utilities for messaging and member management

const WHOP_API_KEY = process.env.WHOP_API_KEY;
const WHOP_BASE_URL = 'https://api.whop.com/api/v5';

export async function sendWhopMessage(memberId: string, message: string): Promise<boolean> {
  if (!WHOP_API_KEY) {
    console.warn('WHOP_API_KEY not configured, skipping message');
    return false;
  }

  try {
    const response = await fetch(`${WHOP_BASE_URL}/members/${memberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        type: 'text'
      })
    });

    if (response.ok) {
      console.log(`✅ Sent Whop message to member ${memberId}`);
      return true;
    } else {
      console.error(`❌ Failed to send Whop message: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending Whop message:', error);
    return false;
  }
}
