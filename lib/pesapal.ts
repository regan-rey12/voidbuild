// VoidBuild Pesapal Integration - Automated Payments for Uganda SMEs
// Pesapal 3.0 API - Supports MTN MoMo Uganda, Airtel Money, Visa/Mastercard
// Docs: https://developer.pesapal.com/how-to-integrate/api-reference

let activePesapalBaseUrl = '';

export function getPesapalBaseUrl(): string {
  if (activePesapalBaseUrl) return activePesapalBaseUrl;
  const envUrl = (process.env.PESAPAL_BASE_URL || '').trim();
  if (envUrl && !envUrl.includes('placeholder')) return envUrl.replace(/\/$/, '');
  return 'https://pay.pesapal.com/v3';
}

export function getPesapalKeys(): { consumerKey: string; consumerSecret: string } {
  const key = (
    process.env.PESAPAL_CONSUMER_KEY ||
    process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY ||
    ''
  ).trim().replace(/^['"`\[\s]+/, '').replace(/['"`\]\s]+$/, '');

  const secret = (
    process.env.PESAPAL_CONSUMER_SECRET ||
    process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET ||
    ''
  ).trim().replace(/^['"`\[\s]+/, '').replace(/['"`\]\s]+$/, '');

  return { consumerKey: key, consumerSecret: secret };
}

interface PesapalAuthResponse {
  token: string;
  expiryDate?: string;
  error?: any;
  message?: string;
  status?: string;
}

export async function getPesapalToken(): Promise<{ token: string; baseUrl: string }> {
  const { consumerKey, consumerSecret } = getPesapalKeys();

  if (!consumerKey || !consumerSecret || consumerKey.includes('placeholder') || consumerKey.includes('your_')) {
    throw new Error('Pesapal credentials missing. Please set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET in Vercel Environment Variables.');
  }

  const primaryUrl = getPesapalBaseUrl();
  const candidateUrls = [primaryUrl];
  
  // Try both Live and Sandbox to auto-detect the key's target environment
  if (primaryUrl.includes('cybqa.pesapal.com')) {
    candidateUrls.push('https://pay.pesapal.com/v3');
  } else {
    candidateUrls.push('https://cybqa.pesapal.com/pesapalv3');
  }

  let lastErrorMsg = '';

  for (const url of candidateUrls) {
    try {
      const res = await fetch(`${url}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
        }),
      });

      const data: PesapalAuthResponse = await res.json().catch(() => ({}));
      
      if (res.ok && data.token) {
        activePesapalBaseUrl = url;
        return { token: data.token, baseUrl: url };
      }

      const errDetail = data.error?.message || data.message || data.error || `HTTP ${res.status}`;
      lastErrorMsg = `${url.includes('cybqa') ? 'Sandbox' : 'Live'}: ${errDetail}`;
    } catch (e: any) {
      lastErrorMsg = e.message;
    }
  }

  throw new Error(`Pesapal Authentication Failed — ${lastErrorMsg}. Please verify your PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET in Vercel.`);
}

export interface CreateOrderParams {
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

export interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: any;
  message?: string;
  status?: string;
}

export async function createPesapalOrder(params: CreateOrderParams, token: string, baseUrl?: string): Promise<PesapalOrderResponse> {
  const targetUrl = baseUrl || getPesapalBaseUrl();
  
  const payload = {
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
  };

  const res = await fetch(`${targetUrl}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal Order Failed (${res.status}): ${text.slice(0, 400)}`);
  }

  const data = await res.json();
  return data as PesapalOrderResponse;
}

export async function getPesapalTransactionStatus(orderTrackingId: string, token: string, baseUrl?: string) {
  const targetUrl = baseUrl || getPesapalBaseUrl();
  const res = await fetch(`${targetUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal status failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return await res.json();
}

export async function registerPesapalIPN(callbackUrl: string, token: string, baseUrl?: string) {
  const targetUrl = baseUrl || getPesapalBaseUrl();
  const res = await fetch(`${targetUrl}/api/URLSetup/RegisterIPN`, {
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
    throw new Error(`Pesapal IPN registration failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return await res.json();
}
