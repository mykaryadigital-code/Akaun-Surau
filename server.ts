import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';

// Load environment variables if any
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- TOYYIBPAY API SECURE PROXY ---
  app.post('/api/create-bill', async (req, res) => {
    try {
      const { amount, name, email, phone } = req.body;
      
      const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET_KEY || 'pj15zsxo-4y87-pwky-i11o-jc9p47lx75j8';
      const TOYYIBPAY_CATEGORY = process.env.TOYYIBPAY_CATEGORY_CODE || 'e01m1sk5';

      // We use the dev URL. For production, change to: https://toyyibpay.com/index.php/api/createBill
      const toyyibpayUrl = 'https://dev.toyyibpay.com/index.php/api/createBill';

      const formData = new URLSearchParams();
      formData.append('userSecretKey', TOYYIBPAY_SECRET);
      formData.append('categoryCode', TOYYIBPAY_CATEGORY);
      formData.append('billName', 'Langganan Sistem Kewangan Surau');
      formData.append('billDescription', 'Langganan Tahunan SaaS (12 Bulan)');
      formData.append('billPriceSetting', '1'); // Fixed amount
      formData.append('billPayorInfo', '1');    // Required payer info
      formData.append('billAmount', amount.toString()); 
      formData.append('billReturnUrl', 'https://localhost:3000'); // Normally would be your live domain
      formData.append('billCallbackUrl', 'https://localhost:3000/api/webhook/toyyibpay');
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

      const data = await response.json();

      if (Array.isArray(data) && data[0]?.BillCode) {
        const billCode = data[0].BillCode;
        // For production, use: https://dev.toyyibpay.com/${billCode}
        res.json({ success: true, paymentUrl: `https://dev.toyyibpay.com/${billCode}` });
      } else {
        res.status(400).json({ success: false, error: 'Gagal dari ToyyibPay', details: data });
      }

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
