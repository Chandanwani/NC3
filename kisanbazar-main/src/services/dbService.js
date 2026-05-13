// 🗄️  My_Agri AI — Firebase Realtime Database Service
// All read/write operations for the app's backend data.
// Every function gracefully falls back when Firebase is not configured.

import { db, isConfigured } from './firebase';
import { ref, get, set, push, update, onValue, serverTimestamp } from 'firebase/database';

// ══════════════════════════════════════════════════════════════
//  SOIL HEALTH
// ══════════════════════════════════════════════════════════════

/**
 * Get latest soil sensor readings for a user.
 * Firebase path: /soil/{userId}/latest
 */
export const getSoilData = async (userId = 'demo-user') => {
    if (!isConfigured || !db) return null;
    try {
        const snap = await get(ref(db, `soil/${userId}/latest`));
        return snap.exists() ? snap.val() : null;
    } catch (e) {
        console.warn('getSoilData error:', e.message);
        return null;
    }
};

/**
 * Save soil readings (for IoT device writes or manual entry).
 * Firebase path: /soil/{userId}/latest
 */
export const saveSoilData = async (userId = 'demo-user', data) => {
    if (!isConfigured || !db) return;
    try {
        await set(ref(db, `soil/${userId}/latest`), {
            ...data,
            updatedAt: Date.now(),
        });
    } catch (e) {
        console.warn('saveSoilData error:', e.message);
    }
};

// ══════════════════════════════════════════════════════════════
//  MARKET PRICES
// ══════════════════════════════════════════════════════════════

/**
 * Get commodity prices.
 * Firebase path: /markets/prices
 */
export const getMarketPrices = async () => {
    if (!isConfigured || !db) return null;
    try {
        const snap = await get(ref(db, 'markets/prices'));
        return snap.exists() ? snap.val() : null;
    } catch (e) {
        console.warn('getMarketPrices error:', e.message);
        return null;
    }
};

/**
 * Subscribe to real-time market price updates.
 * @returns unsubscribe function
 */
export const subscribeMarketPrices = (callback) => {
    if (!isConfigured || !db) return () => { };
    const unsubscribe = onValue(ref(db, 'markets/prices'), (snap) => {
        if (snap.exists()) callback(snap.val());
    });
    return unsubscribe;
};

// ══════════════════════════════════════════════════════════════
//  COMMUNITY POSTS
// ══════════════════════════════════════════════════════════════

/**
 * Subscribe to community posts (real-time listener).
 * Firebase path: /community/posts
 * @returns unsubscribe function
 */
export const subscribeCommunityPosts = (callback) => {
    if (!isConfigured || !db) return () => { };
    const postsRef = ref(db, 'community/posts');
    const unsubscribe = onValue(postsRef, (snap) => {
        if (snap.exists()) {
            const data = snap.val();
            // Convert Firebase object to sorted array (newest first)
            const posts = Object.entries(data)
                .map(([id, post]) => ({ id, ...post }))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            callback(posts);
        } else {
            callback([]);
        }
    });
    return unsubscribe;
};

/**
 * Add a new community post.
 */
export const addCommunityPost = async (author, region, text) => {
    if (!isConfigured || !db) return null;
    try {
        const postsRef = ref(db, 'community/posts');
        const newPost = {
            author,
            region,
            text,
            likes: 0,
            timestamp: Date.now(),
        };
        const newRef = await push(postsRef, newPost);
        return newRef.key;
    } catch (e) {
        console.warn('addCommunityPost error:', e.message);
        return null;
    }
};

/**
 * Increment likes on a post.
 */
export const likeCommunityPost = async (postId, currentLikes) => {
    if (!isConfigured || !db) return;
    try {
        await update(ref(db, `community/posts/${postId}`), {
            likes: currentLikes + 1,
        });
    } catch (e) {
        console.warn('likeCommunityPost error:', e.message);
    }
};

// ══════════════════════════════════════════════════════════════
//  SUPPLY CHAIN / LOGISTICS
// ══════════════════════════════════════════════════════════════

/**
 * Get supply chain risk data.
 * Firebase path: /logistics/risks
 */
export const getSupplyChainData = async () => {
    if (!isConfigured || !db) return null;
    try {
        const snap = await get(ref(db, 'logistics/risks'));
        return snap.exists() ? snap.val() : null;
    } catch (e) {
        console.warn('getSupplyChainData error:', e.message);
        return null;
    }
};

/**
 * Subscribe to live supply chain updates.
 */
export const subscribeSupplyChain = (callback) => {
    if (!isConfigured || !db) return () => { };
    return onValue(ref(db, 'logistics/risks'), (snap) => {
        if (snap.exists()) callback(snap.val());
    });
};

// ══════════════════════════════════════════════════════════════
//  DISEASE SCAN HISTORY
// ══════════════════════════════════════════════════════════════

/**
 * Save a disease scan result.
 * Firebase path: /scans/{userId}/{pushId}
 */
export const saveScanResult = async (userId = 'demo-user', result) => {
    if (!isConfigured || !db) return;
    try {
        await push(ref(db, `scans/${userId}`), {
            ...result,
            timestamp: Date.now(),
        });
    } catch (e) {
        console.warn('saveScanResult error:', e.message);
    }
};

/**
 * Get last 10 scan history items.
 * Firebase path: /scans/{userId}
 */
export const getScanHistory = async (userId = 'demo-user') => {
    if (!isConfigured || !db) return [];
    try {
        const snap = await get(ref(db, `scans/${userId}`));
        if (!snap.exists()) return [];
        const scans = Object.entries(snap.val())
            .map(([id, s]) => ({ id, ...s }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 10);
        return scans;
    } catch (e) {
        console.warn('getScanHistory error:', e.message);
        return [];
    }
};

// ══════════════════════════════════════════════════════════════
//  USER PROFILE
// ══════════════════════════════════════════════════════════════

/**
 * Save user profile data.
 * Firebase path: /users/{userId}
 */
export const saveUserProfile = async (userId, data) => {
    if (!isConfigured || !db) return;
    try {
        await update(ref(db, `users/${userId}`), {
            ...data,
            updatedAt: Date.now(),
        });
    } catch (e) {
        console.warn('saveUserProfile error:', e.message);
    }
};

/**
 * Get user profile data.
 */
export const getUserProfile = async (userId) => {
    if (!isConfigured || !db) return null;
    try {
        const snap = await get(ref(db, `users/${userId}`));
        return snap.exists() ? snap.val() : null;
    } catch (e) {
        console.warn('getUserProfile error:', e.message);
        return null;
    }
};

/**
 * Get user scan count.
 */
export const getUserScanCount = async (userId = 'demo-user') => {
    if (!isConfigured || !db) return 0;
    try {
        const snap = await get(ref(db, `scans/${userId}`));
        return snap.exists() ? Object.keys(snap.val()).length : 0;
    } catch (e) {
        return 0;
    }
};

/**
 * Get user post count.
 */
export const getUserPostCount = async (author) => {
    if (!isConfigured || !db) return 0;
    try {
        const snap = await get(ref(db, 'community/posts'));
        if (!snap.exists()) return 0;
        return Object.values(snap.val()).filter(p => p.author === author).length;
    } catch (e) {
        return 0;
    }
};
