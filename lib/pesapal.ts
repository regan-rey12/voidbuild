// VoidBuild Pesapal Integration - Serious Automated Payments for Uganda SMEs
// Pesapal 3.0 API - Supports MTN MoMo Uganda, Airtel Money, Cards, 3.5% fee, SME friendly
// Docs: https://developer.pesapal.com/how-to-integrate/api-reference

const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3'; // Sandbox: https://cybqa.pesapal.com/pesapalv3
const CONSUMER_KEY = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY || process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: any;
}

export async function getPesapalToken(): Promise<string> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET || CONSUMER_KEY.includes('placeholder')) {
    throw new Error('Pesapal not configured - add PESAPAL_CONSUMER_KEY and CONSUMER_SECRET to .env.local from pesapal.com/ug');
  }

  const res = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal auth failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data: PesapalAuthResponse = await res.json();
  if (!data.token) throw new Error('Pesapal no token returned');
  return data.token;
}

interface CreateOrderParams {
  amount: number;
  currency?: string;
  description: string;
  callbackUrl: string;
  notificationId: string;
  billingAddress: {
    email: string;
    phone: string;
    firstName?: string;
    lastName?: string;
  };
  merchantReference: string;
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: any;
}

export async function createPesapalOrder(params: CreateOrderParams, token: string): Promise<PesapalOrderResponse> {
  const res = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: params.merchantReference,
      currency: params.currency || 'UGX',
      amount: params.amount,
      description: params.description,
      callback_url: params.callbackUrl,
      notification_id: params.notificationId,
      billing_address: {
        email_address: params.billingAddress.email,
        phone_number: params.billingAddress.phone,
        country_code: 'UG',
        first_name: params.billingAddress.firstName || 'VoidBuild',
        last_name: params.billingAddress.lastName || 'Customer',
        line_1: 'Kampala',
        city: 'Kampala',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal order failed: ${res.status} ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  return data as PesapalOrderResponse;
}

export async function getPesapalTransactionStatus(orderTrackingId: string, token: string) {
  const res = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal status failed: ${res.status} ${text.slice(0, 200)}`);
  }

  return await res.json();
}

// Helper to get IPN id - you need to register IPN URL in Pesapal dashboard once
export async function registerPesapalIPN(callbackUrl: string, token: string) {
  const res = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: callbackUrl,
      ipn_notification_type: 'GET',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal IPN register failed: ${res.status} ${text.slice(0, 200)}`);
  }

  return await res.json();
}
