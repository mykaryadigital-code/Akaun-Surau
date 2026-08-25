import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import fs from 'fs';

// Load environment variables if any
import dotenv from 'dotenv';
dotenv.config();

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: admin.app.App | null = null;

function getAdminDb() {
  if (!adminApp) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        let serviceAccount;
        const envVal = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        if (envVal.trim().startsWith('{')) {
          serviceAccount = JSON.parse(envVal);
        } else {
          serviceAccount = JSON.parse(Buffer.from(envVal, 'base64').toString('utf-8'));
        }
        adminApp = admin.initializeApp({ credential: admin.cert(serviceAccount) });
        console.log("Firebase Admin initialized successfully.");
      } catch (err: any) {
        throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64. Ensure it is either valid JSON or base64 encoded.");
      }
    } else {
      try {
        adminApp = admin.initializeApp();
        console.log("Firebase Admin initialized via ADC.");
      } catch (err: any) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is required to update the database via webhook. Please set it in your environment variables.");
      }
    }
  }
  return getFirestore(adminApp as any, 'ai-studio-sistemkewangansu-21245cda-615c-4689-801e-66fda632fa6d');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- TOYYIBPAY API SECURE PROXY ---
  app.post('/api/create-bill', async (req, res) => {
    try {
      const { amount, name, email, phone, returnUrl, packageId, userId } = req.body;
      
      const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET_KEY || 'pj15zsxo-4y87-pwky-i11o-jc9p47lx75j8';
      const TOYYIBPAY_CATEGORY = process.env.TOYYIBPAY_CATEGORY_CODE || 'e01m1sk5';

      // Live production URL
      const toyyibpayUrl = 'https://toyyibpay.com/index.php/api/createBill';
      const formData = new URLSearchParams();
      formData.append('userSecretKey', TOYYIBPAY_SECRET);
      formData.append('categoryCode', TOYYIBPAY_CATEGORY);
      formData.append('billName', 'Langganan Sistem Kewangan Surau');
      formData.append('billDescription', 'Langganan Tahunan SaaS (12 Bulan)');
      formData.append('billPriceSetting', '1'); // Fixed amount
      formData.append('billPayorInfo', '1');    // Required payer info
      formData.append('billAmount', amount.toString()); 
      formData.append('billReturnUrl', returnUrl || 'http://localhost:3000'); // Dynamic return URL
      formData.append('billCallbackUrl', returnUrl ? `${returnUrl}/api/webhook/toyyibpay` : 'http://localhost:3000/api/webhook/toyyibpay');
      
      const extRef = `SUB-${userId || 'NA'}-${packageId || 'yearly'}-${Date.now()}`;
      formData.append('billExternalReferenceNo', extRef);
      
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
        // Live production URL
        res.json({ success: true, paymentUrl: `https://toyyibpay.com/${billCode}` });
      } else {
        res.status(400).json({ success: false, error: 'Gagal dari ToyyibPay', details: data });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // --- WEBHOOK RECEIVER ---
  app.post('/api/webhook/toyyibpay', async (req, res) => {
    try {
      const { refno, status, billcode, transaction_id, amount } = req.body;
      console.log(`[WEBHOOK] Received from ToyyibPay. RefNo: ${refno}, Status: ${status}, BillCode: ${billcode}`);

      if (status === '1') {
        // --- VERIFY PAYMENT WITH TOYYIBPAY BEFORE UPDATING ---
        const formData = new URLSearchParams();
        formData.append('billCode', billcode);
        const verifyUrl = 'https://toyyibpay.com/index.php/api/getBillTransactions';
        const verifyResponse = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });
        const verifyData = await verifyResponse.json();
        
        const isAuthentic = Array.isArray(verifyData) && verifyData.some((txn: any) => txn.billpaymentStatus === '1');
        
        if (!isAuthentic) {
          console.warn(`[WEBHOOK] Security Warning: Payment verification failed for billcode ${billcode}. Potential spoofing attempt.`);
          return res.status(400).send('Verification Failed');
        }

        const parts = refno ? refno.split('-') : [];
        if (parts.length >= 4) {
          const userId = parts[1];
          const packageId = parts[2];

          console.log(`[WEBHOOK] Payment verified & successful for user ${userId}, package ${packageId}`);
          try {
            const db = getAdminDb();
            const docRef = db.collection('surau_settings').doc(userId);
            const docSnap = await docRef.get();
            let currentValidUntil = Date.now();
            if (docSnap.exists) {
              const data = docSnap.data();
              if (data?.subscription?.validUntil) {
                currentValidUntil = new Date(data.subscription.validUntil).getTime();
              }
            }
            const baseTime = Math.max(currentValidUntil, Date.now());
            let daysToAdd = 365;
            if (packageId === 'monthly') daysToAdd = 30;
            else if (packageId === 'pro') daysToAdd = 36500;
            
            const newValidUntil = new Date(baseTime + (daysToAdd * 24 * 60 * 60 * 1000)).toISOString();
            await docRef.set({
              subscription: {
                status: 'active',
                validUntil: newValidUntil
              }
            }, { merge: true });
            
            console.log(`[WEBHOOK] Firestore updated for user ${userId}. New Expiry: ${newValidUntil}`);
          } catch (dbErr: any) {
            console.error(`[WEBHOOK] Failed to update Firestore:`, dbErr.message);
          }
        }
      }
      res.status(200).send('OK');
    } catch (err) {
      console.error('[WEBHOOK] Error:', err);
      res.status(500).send('Error');
    }
  });

  app.post('/api/verify-payment', async (req, res) => {
    try {
      const { billCode } = req.body;
      const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET_KEY || 'pj15zsxo-4y87-pwky-i11o-jc9p47lx75j8';
      
      const formData = new URLSearchParams();
      formData.append('billCode', billCode);
      
      // Live production URL
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
  });

  // Vite middleware for development
  const distPath = path.join(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
