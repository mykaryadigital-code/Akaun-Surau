export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { amount, name, email, phone, returnUrl } = body;
    
    // Gunakan Environment Variable dari Vercel
    const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET_KEY || 'pj15zsxo-4y87-pwky-i11o-jc9p47lx75j8';
    const TOYYIBPAY_CATEGORY = process.env.TOYYIBPAY_CATEGORY_CODE || 'e01m1sk5';

    const toyyibpayUrl = 'https://toyyibpay.com/index.php/api/createBill';

    const formData = new URLSearchParams();
    formData.append('userSecretKey', TOYYIBPAY_SECRET);
    formData.append('categoryCode', TOYYIBPAY_CATEGORY);
    formData.append('billName', 'Langganan Akaun Surau'); // Max 30 chars limit
    formData.append('billDescription', 'Langganan Tahunan SaaS (12 Bulan)');
    formData.append('billPriceSetting', '1'); // Fixed amount
    formData.append('billPayorInfo', '1');    // Required payer info
    formData.append('billAmount', (amount || 12000).toString()); 
    formData.append('billReturnUrl', returnUrl || 'https://akaun-surau.vercel.app');
    formData.append('billCallbackUrl', returnUrl ? `${returnUrl}/api/webhook/toyyibpay` : 'https://akaun-surau.vercel.app/api/webhook/toyyibpay');
    formData.append('billExternalReferenceNo', 'SUB-' + Date.now());
    formData.append('billTo', name || 'Admin Surau');
    formData.append('billEmail', email || 'admin@surau.com');
    formData.append('billPhone', phone || '0123456789');

    const response = await fetch(toyyibpayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const textData = await response.text();
    let data;
    try {
      // Sometimes Toyyibpay returns whitespace or PHP warnings before JSON
      data = JSON.parse(textData.trim());
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Gagal parse JSON dari ToyyibPay', raw: textData });
    }

    if (Array.isArray(data) && data[0]?.BillCode) {
      const billCode = data[0].BillCode;
      res.json({ success: true, paymentUrl: `https://toyyibpay.com/${billCode}` });
    } else {
      res.status(400).json({ success: false, error: 'Gagal dari ToyyibPay', details: data });
    }

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  }
}
