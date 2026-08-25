import * as admin from 'firebase-admin';

let adminApp = null;
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
      } catch (err) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64");
      }
    } else {
      adminApp = admin.initializeApp();
    }
  }
  return adminApp.firestore(); // default db
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { refno, status, billcode, transaction_id, amount } = req.body;
    console.log(`[WEBHOOK] Received from ToyyibPay. RefNo: ${refno}, Status: ${status}, BillCode: ${billcode}`);
    
    if (status === '1') {
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
      
      const isAuthentic = Array.isArray(verifyData) && verifyData.some((txn) => txn.billpaymentStatus === '1');
      if (!isAuthentic) {
        console.warn(`[WEBHOOK] Security Warning: Payment verification failed for billcode ${billcode}.`);
        return res.status(400).send('Verification Failed');
      }

      const parts = refno ? refno.split('-') : [];
      if (parts.length >= 4) {
        const userId = parts[1];
        const packageId = parts[2];
        try {
          const db = getAdminDb();
          // We need the exact database ID to be safe if Vercel defaults don't work, 
          // but firestore() usually defaults nicely. 
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
        } catch (dbErr) {
          console.error(`[WEBHOOK] Failed to update Firestore:`, dbErr.message);
        }
      }
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('[WEBHOOK] Error:', err);
    res.status(500).send('Error');
  }
}
