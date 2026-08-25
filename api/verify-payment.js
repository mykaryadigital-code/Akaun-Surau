export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { billCode } = req.body;
    const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET_KEY || 'pj15zsxo-4y87-pwky-i11o-jc9p47lx75j8';
    
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
    if (Array.isArray(data)) {
      const isPaid = data.some((txn) => txn.billpaymentStatus === '1');
      res.status(200).json({ success: true, isPaid });
    } else {
      res.status(200).json({ success: false, error: 'Tiada rekod', data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
