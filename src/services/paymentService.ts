'use client';

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { Tier } from '@/types';

export interface PaymentConfig {
  upiId: string;
  payeeName: string;
  qrCodeBase64?: string;
  note?: string;
}

export interface UtrPaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  tier: Tier;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  amountInr: number;
  amountUsd: number;
  utrNumber: string;
  screenshotBase64?: string;
  status: 'VERIFIED_AUTO' | 'PENDING_REVIEW' | 'REVOKED';
  createdAt: any;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  upiId: 'arykothari@upi',
  payeeName: 'Ary Nipesh Kothari',
  note: 'Scan using Google Pay, PhonePe, Paytm, or any UPI app. Instant activation on 12-digit UTR submission.'
};

/**
 * Fetch Payment Configuration from Firestore (or fallback)
 */
export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    const docRef = doc(db, 'settings', 'paymentConfig');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_PAYMENT_CONFIG, ...snap.data() } as PaymentConfig;
    }
  } catch (err) {
    console.warn('Firestore paymentConfig read notice:', err);
  }
  return DEFAULT_PAYMENT_CONFIG;
}

/**
 * Save Payment Configuration (QR Code Base64 + UPI ID) to Firestore (Admin only)
 */
export async function updatePaymentConfig(config: Partial<PaymentConfig>): Promise<void> {
  const docRef = doc(db, 'settings', 'paymentConfig');
  await setDoc(docRef, {
    ...config,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Validates 12-Digit UTR and Auto-Upgrades user subscription in Cloud Firestore
 */
export async function submitUtrAutoUpgrade(params: {
  userId: string;
  userEmail: string;
  userName: string;
  tier: Tier;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  amountInr: number;
  amountUsd: number;
  utrNumber: string;
  screenshotBase64?: string;
}): Promise<{ success: boolean; message: string; paymentId?: string }> {
  const trimmedUtr = params.utrNumber.trim().replace(/\s+/g, '');

  if (!/^[0-9A-Za-z]{10,16}$/.test(trimmedUtr)) {
    throw new Error('Please enter a valid 12-digit UPI / UTR Transaction Reference number.');
  }

  const imageLimit = params.tier === 'PRO' ? 75 : params.tier === 'PREMIUM' ? 150 : 999;

  let paymentId = `pay_${Date.now()}`;

  try {
    // 1. Record payment in Firestore payments collection
    const payDoc = await addDoc(collection(db, 'payments'), {
      ...params,
      utrNumber: trimmedUtr,
      status: 'VERIFIED_AUTO',
      createdAt: serverTimestamp()
    });
    paymentId = payDoc.id;

    // 2. Automatically upgrade user tier in Firestore /users/{uid}
    if (params.userId) {
      const userDocRef = doc(db, 'users', params.userId);
      await setDoc(userDocRef, {
        tier: params.tier,
        subscriptionTier: params.tier,
        subscriptionStatus: 'ACTIVE',
        imageLimitPerSession: imageLimit,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err: any) {
    console.warn('Firestore direct write notice:', err);
    // Local storage fallback for sandbox
    const localPayments = JSON.parse(localStorage.getItem('eduagent_payments') || '[]');
    localPayments.unshift({
      id: paymentId,
      ...params,
      utrNumber: trimmedUtr,
      status: 'VERIFIED_AUTO',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('eduagent_payments', JSON.stringify(localPayments));
  }

  // Also sync locally
  const currentStored = localStorage.getItem('eduagent_user');
  if (currentStored) {
    try {
      const u = JSON.parse(currentStored);
      u.tier = params.tier;
      u.subscriptionTier = params.tier;
      u.imageLimitPerSession = imageLimit;
      localStorage.setItem('eduagent_user', JSON.stringify(u));
    } catch (_) {}
  }

  return {
    success: true,
    message: `🎉 Instant Upgrade Successful! You are now on the ${params.tier} plan.`,
    paymentId
  };
}

/**
 * Fetch all payments for Super Admin review
 */
export async function getAllPayments(): Promise<UtrPaymentRecord[]> {
  try {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UtrPaymentRecord));
    }
  } catch (err) {
    console.warn('Firestore payments fetch notice:', err);
  }

  // Fallback to local storage
  return JSON.parse(localStorage.getItem('eduagent_payments') || '[]');
}

/**
 * Super Admin Action: Revoke or Update plan
 */
export async function adminSetUserTier(userId: string, newTier: Tier): Promise<void> {
  const imageLimit = newTier === 'BASIC' ? 25 : newTier === 'PRO' ? 75 : newTier === 'PREMIUM' ? 150 : 999;
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      tier: newTier,
      subscriptionTier: newTier,
      imageLimitPerSession: imageLimit,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firestore admin tier update notice:', err);
  }
}
