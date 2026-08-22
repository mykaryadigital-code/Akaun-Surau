const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');
dotenv.config();

async function fixUser() {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        let serviceAccount;
        const envVal = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        if (envVal.trim().startsWith('{')) {
          serviceAccount = JSON.parse(envVal);
        } else {
          serviceAccount = JSON.parse(Buffer.from(envVal, 'base64').toString('utf-8'));
        }
        let app = initializeApp({ credential: cert(serviceAccount) });
    } else {
        console.error("No service account found in .env");
        process.exit(1);
    }

    const email = 'paratuh@gmail.com';
    const userRecord = await getAuth().getUserByEmail(email);
    console.log(`User found: ${userRecord.uid}`);

    // Assuming app is the default app, we can just pass undefined as the app or get the app instance
    // Let's retrieve the default app
    const { getApp } = require('firebase-admin/app');
    const app = getApp();
    const db = getFirestore(app, 'ai-studio-sistemkewangansu-21245cda-615c-4689-801e-66fda632fa6d');
    const docRef = db.collection('surau_settings').doc(userRecord.uid);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log('No settings document found for this user.');
      return;
    }

    const data = doc.data();
    console.log('Current validUntil:', data?.subscription?.validUntil);

    const newValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await docRef.set({
      subscription: {
        status: 'active',
        validUntil: newValidUntil
      }
    }, { merge: true });

    console.log(`Updated validUntil to: ${newValidUntil}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUser();
