// 🔐 My_Agri AI — Authentication Service

import { isConfigured } from './firebase';

let signInFn, signUpFn, signOutFn, onAuthChangedFn, updateProfileFn, authRef;

if (isConfigured) {
    const { auth } = require('./firebase');
    const authModule = require('firebase/auth');
    authRef = auth;
    signInFn = authModule.signInWithEmailAndPassword;
    signUpFn = authModule.createUserWithEmailAndPassword;
    signOutFn = authModule.signOut;
    onAuthChangedFn = authModule.onAuthStateChanged;
    updateProfileFn = authModule.updateProfile;
}

// ── Sign in existing user ──────────────────────────────────────
export const signIn = async (email, password) => {
    if (!isConfigured || !authRef) throw new Error('Firebase not configured. Add credentials to src/services/firebase.js');
    const result = await signInFn(authRef, email, password);
    return result.user;
};

// ── Create new user ───────────────────────────────────────────
export const signUp = async (email, password, displayName) => {
    if (!isConfigured || !authRef) throw new Error('Firebase not configured. Add credentials to src/services/firebase.js');
    const result = await signUpFn(authRef, email, password);
    // Save display name to Firebase Auth profile
    if (displayName && result.user) {
        await updateProfileFn(result.user, { displayName });
    }
    return result.user;
};

// ── Update display name ───────────────────────────────────────
export const updateDisplayName = async (displayName) => {
    if (!isConfigured || !authRef?.currentUser) return;
    await updateProfileFn(authRef.currentUser, { displayName });
};

// ── Sign out ──────────────────────────────────────────────────
export const logout = async () => {
    if (!isConfigured || !authRef) return;
    await signOutFn(authRef);
};

// ── Auth state listener ───────────────────────────────────────
export const onAuthChange = (callback) => {
    if (!isConfigured || !authRef) {
        callback(null);
        return () => { };
    }
    return onAuthChangedFn(authRef, callback);
};

// ── Get current user ──────────────────────────────────────────
export const getCurrentUser = () => authRef?.currentUser || null;
