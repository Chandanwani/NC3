import { useState, useEffect } from 'react';
import { db, isConfigured } from '../services/firebase';

let onValue, push, set, ref, serverTimestamp;

if (isConfigured && db) {
    const dbModule = require('firebase/database');
    onValue = dbModule.onValue;
    push = dbModule.push;
    set = dbModule.set;
    ref = dbModule.ref;
    serverTimestamp = dbModule.serverTimestamp;
}

// Hook: Subscribe to any Firebase Realtime Database path
export const useRealtimeData = (path) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!path || !isConfigured || !db) {
            setLoading(false);
            return;
        }
        const dbRef = ref(db, path);
        const unsubscribe = onValue(
            dbRef,
            (snapshot) => {
                setData(snapshot.val());
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [path]);

    return { data, loading, error };
};

// Write a value to Firebase
export const writeData = async (path, value) => {
    if (!isConfigured || !db) return;
    await set(ref(db, path), value);
};

// Push a new item to a Firebase list
export const pushData = async (path, value) => {
    if (!isConfigured || !db) return null;
    const newRef = push(ref(db, path));
    await set(newRef, { ...value, timestamp: serverTimestamp() });
    return newRef.key;
};
