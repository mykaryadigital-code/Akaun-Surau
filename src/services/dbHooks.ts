import { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy, getDoc, writeBatch } from 'firebase/firestore';
import { AppSettings, Transaction } from '../types';
import { DEFAULT_SETTINGS } from '../utils/initialData';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}

export function useFirestoreData(user: User | null) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setTransactions([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const orgId = user.uid;
    const settingsRef = doc(db, 'surau_settings', orgId);
    
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      } else {
        // Seed default settings for new user
        setDoc(settingsRef, DEFAULT_SETTINGS).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `surau_settings/${orgId}`);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `surau_settings/${orgId}`);
    });

    const txRef = collection(db, 'surau_settings', orgId, 'transactions');
    const txQuery = query(txRef, orderBy('createdAt', 'desc'));
    
    const unsubTransactions = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Transaction));
      setTransactions(txs);
      setDataLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `surau_settings/${orgId}/transactions`);
    });

    return () => {
      unsubSettings();
      unsubTransactions();
    };
  }, [user]);

  const updateSettings = async (newSettings: AppSettings) => {
    if (!user) return;
    try {
      const settingsRef = doc(db, 'surau_settings', user.uid);
      await setDoc(settingsRef, newSettings, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `surau_settings/${user.uid}`);
    }
  };

  const addTransaction = async (tx: Transaction) => {
    if (!user) return;
    try {
      const txRef = doc(db, 'surau_settings', user.uid, 'transactions', tx.id);
      const dataToSave = { ...tx, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      // Remove undefined values
      if (dataToSave.attachmentUrl === undefined) {
        delete dataToSave.attachmentUrl;
      }
      if (dataToSave.notes === undefined) {
        delete dataToSave.notes;
      }
      await setDoc(txRef, dataToSave);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `surau_settings/${user.uid}/transactions/${tx.id}`);
    }
  };

  const updateTransaction = async (tx: Transaction) => {
    if (!user) return;
    try {
      const txRef = doc(db, 'surau_settings', user.uid, 'transactions', tx.id);
      const dataToSave = { ...tx, updatedAt: new Date().toISOString() };
      if (dataToSave.attachmentUrl === undefined) {
        delete dataToSave.attachmentUrl;
      }
      if (dataToSave.notes === undefined) {
        delete dataToSave.notes;
      }
      await setDoc(txRef, dataToSave, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `surau_settings/${user.uid}/transactions/${tx.id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      const txRef = doc(db, 'surau_settings', user.uid, 'transactions', id);
      await deleteDoc(txRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `surau_settings/${user.uid}/transactions/${id}`);
    }
  };
  
  const clearAllData = async () => {
    if (!user) return;
    try {
      // Create a batch to delete all transactions and reset settings
      const batch = writeBatch(db);
      
      const txRef = collection(db, 'surau_settings', user.uid, 'transactions');
      const snapshot = await getDoc(doc(db, 'surau_settings', user.uid)); // Just to verify we have access
      
      if (settings) {
         const newSettings = {
           ...settings,
           openingBalances: { total: 0, bank: 0, cash: 0 }
         };
         batch.set(doc(db, 'surau_settings', user.uid), newSettings, { merge: true });
      }
      
      // Note: We can't batch delete a collection in client SDK without fetching it.
      // But since tx array is in state, we can use it.
      transactions.forEach(tx => {
         const dRef = doc(db, 'surau_settings', user.uid, 'transactions', tx.id);
         batch.delete(dRef);
      });
      
      await batch.commit();
    } catch (err) {
       handleFirestoreError(err, OperationType.DELETE, `surau_settings/${user.uid}`);
    }
  }

  const importBackupData = async (importedData: any) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      
      if (importedData.settings) {
        batch.set(doc(db, 'surau_settings', user.uid), importedData.settings, { merge: true });
      }
      
      if (Array.isArray(importedData.transactions)) {
        importedData.transactions.forEach((tx: any) => {
           const dRef = doc(db, 'surau_settings', user.uid, 'transactions', tx.id);
           const dataToSave = {
             ...tx,
             updatedAt: new Date().toISOString(),
             createdAt: tx.createdAt || new Date().toISOString()
           };
           if (dataToSave.attachmentUrl === undefined) delete dataToSave.attachmentUrl;
           if (dataToSave.notes === undefined) delete dataToSave.notes;
           batch.set(dRef, dataToSave, { merge: true });
        });
      }
      
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `surau_settings/${user.uid}/backup-import`);
    }
  }

  return {
    settings,
    transactions,
    dataLoading,
    updateSettings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllData,
    importBackupData
  };
}
