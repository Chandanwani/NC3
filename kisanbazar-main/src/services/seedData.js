/**
 * My_Agri AI — Firebase Realtime Database Seed Script
 * ─────────────────────────────────────────────────────
 *
 * HOW TO USE (two options):
 *
 * OPTION 1 — Firebase Console (easiest):
 *   1. Go to console.firebase.google.com → Your Project → Realtime Database
 *   2. Click the 3-dot menu → "Import JSON"
 *   3. Paste the JSON content from the SEED_DATA object below
 *
 * OPTION 2 — Run via Node.js (requires firebase-admin):
 *   npm install firebase-admin
 *   node src/services/seedData.js
 *   (Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account key)
 * ─────────────────────────────────────────────────────
 */

const SEED_DATA = {
    // ── Soil sensor readings (per user) ──────────────────────
    soil: {
        "demo-user": {
            latest: {
                moisture: 65.2,
                ph: 6.8,
                temperature: 24.1,
                nitrogen: 145,
                potassium: 180,
                updatedAt: 1740000000000,
            }
        }
    },

    // ── Market commodity prices ───────────────────────────────
    markets: {
        prices: {
            wheat: { price: 2140, delta: 2.3, unit: "₹/quintal" },
            rice: { price: 1950, delta: -1.1, unit: "₹/quintal" },
            tomato: { price: 28, delta: 4.5, unit: "₹/kg" },
            onion: { price: 22, delta: -0.8, unit: "₹/kg" },
            potato: { price: 18, delta: 1.2, unit: "₹/kg" },
            cotton: { price: 6200, delta: 3.1, unit: "₹/quintal" },
            soybean: { price: 4350, delta: 1.8, unit: "₹/quintal" },
            mustard: { price: 5250, delta: -0.5, unit: "₹/quintal" },
        }
    },

    // ── Community posts ───────────────────────────────────────
    community: {
        posts: {
            post1: {
                author: "Rajesh Kumar",
                region: "Punjab",
                text: "Used AI disease scan — caught early blight on wheat before it spread. Scan weekly during monsoon!",
                likes: 24,
                timestamp: 1740000000000,
            },
            post2: {
                author: "Priya Devi",
                region: "Maharashtra",
                text: "Soil module showed low nitrogen. Adding compost this week. Thanks My_Agri AI!",
                likes: 18,
                timestamp: 1740050000000,
            },
            post3: {
                author: "Mohammed Farhan",
                region: "Telangana",
                text: "Market prices for tomato are up 4.5% this week! Delaying harvest by 3 days based on AI forecast. Fingers crossed 🤞",
                likes: 31,
                timestamp: 1740100000000,
            },
            post4: {
                author: "Vikram Singh",
                region: "Haryana",
                text: "Supply chain alert saved us from a 3-hour delay. Rerouted via expressway and delivered on time.",
                likes: 15,
                timestamp: 1740150000000,
            },
        }
    },

    // ── Supply chain / logistics ──────────────────────────────
    logistics: {
        risks: {
            index: 58,
            zone: "Pune Region",
            alert: "NH-48: Heavy traffic near Lonavala Ghat. 40 min delay expected.",
            alertB: "NH-60: Rainfall warning on Kasara Ghat — exercise caution.",
            alternatives: {
                alt1: { title: "Reroute via Expressway", subtitle: "+15 min | Low Risk" },
                alt2: { title: "Delay Dispatch after 10 PM", subtitle: "Save fuel on Express Lane" },
            }
        }
    },

    // ── Default weather fallback stored in DB ─────────────────
    weather: {
        default: {
            temp: 28,
            condition: "Partly Cloudy",
            icon: "⛅",
            location: "Pune, IN",
            humidity: 72,
            wind: 18,
            advisory: "Light rain expected in 48 hours. Good window for pesticide application today.",
        }
    }
};

// ── OPTION 2: Node.js Admin SDK runner ─────────────────────────
const runSeed = async () => {
    try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
            admin.initializeApp();  // Uses GOOGLE_APPLICATION_CREDENTIALS
        }
        await admin.database().ref('/').update(SEED_DATA);
        console.log('✅ Firebase seeded successfully!');
    } catch (e) {
        console.log('⚠️  Admin SDK not available. Use Firebase Console → Import JSON instead.');
        console.log('\nSeed data to import:\n', JSON.stringify(SEED_DATA, null, 2));
    }
};

if (typeof module !== 'undefined' && require.main === module) {
    runSeed();
}

module.exports = { SEED_DATA, runSeed };
