export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { billCode } = req.body;
    
    const formData = new URLSearchParams();
    formData.append('billCode', billCode);
    
    const toyyibpayUrl = 'https://toyyibpay.com/index.php/api/getBillTransactions';
    
    const response = await fetch(toyyibpayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await response.json();
    
    // Check if there is any successful transaction (billpaymentStatus == 1)
    if (Array.isArray(data)) {
      const isPaid = data.some((txn: any) => txn.billpaymentStatus === '1');
      res.json({ success: true, isPaid });
    } else {
      res.json({ success: false, error: 'Tiada rekod', data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
