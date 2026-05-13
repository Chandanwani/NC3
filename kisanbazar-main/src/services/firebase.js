// 🔥 My_Agri AI — Firebase Configuration
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO CONFIGURE:
// 1. Go to https://console.firebase.google.com
// 2. Create a project → Add Web App → copy config below
// 3. Enable Authentication → Email/Password sign-in
// 4. Create Realtime Database (start in test mode)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ── Check if Firebase is properly configured ──
export const isConfigured =
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.databaseURL !== "YOUR_DATABASE_URL" &&
    firebaseConfig.apiKey.length > 10;

let app = null;
let auth = null;
let db = null;

if (isConfigured) {
    try {
        // Avoid duplicate app init on hot-reload
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        auth = getAuth(app);
        db = getDatabase(app);
        console.log('✅ Firebase connected');
    } catch (e) {
        console.warn('⚠️  Firebase init failed:', e.message);
    }
} else {
    console.log('ℹ️  Firebase not configured — running in demo mode');
}

export { auth, db };
export default app;
