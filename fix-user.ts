import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

async function fixUser() {
  try {
    // We expect FIREBASE_SERVICE_ACCOUNT_BASE64 to be in env, or it runs in a context where it's not needed (like Cloud Run default credentials)
    // But since this is a local script, we might need to parse .env
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        let serviceAccount;
        const envVal = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        if (envVal.trim().startsWith('{')) {
          serviceAccount = JSON.parse(envVal);
        } else {
          serviceAccount = JSON.parse(Buffer.from(envVal, 'base64').toString('utf-8'));
        }
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
        console.error("No service account found in .env");
        process.exit(1);
    }

    const email = 'paratuh@gmail.com';
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`User found: ${userRecord.uid}`);

    const db = admin.firestore();
    const docRef = db.collection('surau_settings').doc(userRecord.uid);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log('No settings document found for this user.');
      return;
    }

    const data = doc.data();
    console.log('Current validUntil:', data?.subscription?.validUntil);

    // Let's give them 30 days from creation, or just extend by 7 days from now.
    // Let's extend by 30 days from today to make them happy.
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
