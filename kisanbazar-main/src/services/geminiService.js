// 🤖 My_Agri AI — Google Gemini AI Service
// ─────────────────────────────────────────────────────────────────────────────
// Get your FREE API key at: https://aistudio.google.com/app/apikey
// Paste it below in GEMINI_API_KEY
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const isGeminiConfigured = GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' && GEMINI_API_KEY.length > 10;

// System context — makes Gemini respond as an agricultural AI assistant
const SYSTEM_CONTEXT = `You are My_Agri AI, an expert agricultural assistant for Indian farmers, 
especially in Maharashtra/Pune region. You give concise, practical advice on:
- Crop diseases, treatments, and prevention
- Soil health, pH, nitrogen, potassium, and irrigation
- Market prices and optimal selling times
- Weather impacts on farming
- Sustainable and organic farming practices
Keep responses under 100 words. Always be encouraging and practical. Use simple language.`;

/**
 * Ask Gemini a farming question.
 * @param {string} userMessage - The farmer's question
 * @returns {Promise<string>} - AI response text
 */
export const askGemini = async (userMessage) => {
    if (!isGeminiConfigured) {
        return getFallbackResponse(userMessage);
    }

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: SYSTEM_CONTEXT },
                        { text: `\n\nFarmer's question: ${userMessage}` }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || "I'm processing your question. Please try again in a moment.";
    } catch (err) {
        console.warn('Gemini error:', err.message);
        return getFallbackResponse(userMessage);
    }
};

/**
 * Generate AI disease treatment recommendation
 * @param {string} diseaseName - Detected disease name
 * @param {number} confidence - Detection confidence %
 * @returns {Promise<string>}
 */
export const getDiseaseAdvice = async (diseaseName, confidence) => {
    if (!isGeminiConfigured) {
        return null; // Will use local DB fallback
    }

    const prompt = `A crop scan detected "${diseaseName}" with ${confidence}% confidence. 
    Give a 3-point action plan: 1) Immediate treatment 2) Prevention 3) Expected recovery time. 
    Be specific with chemical/organic options for Indian farmers.`;

    return askGemini(prompt);
};

// ── Fallback responses when Gemini not configured ──
const FALLBACK_RESPONSES = {
    soil: "🌱 Check soil moisture and pH levels regularly. For optimal growth, maintain pH 6.0–7.5. Add compost to improve nitrogen content.",
    disease: "🔬 Disease detected! Apply recommended fungicide. Remove affected leaves and improve air circulation around plants.",
    market: "📈 Monitor weekly price trends. Best time to sell is usually early morning at local mandi. Keep track of seasonal demand.",
    weather: "🌤️ Weather looks favorable for farming. Monitor humidity — above 80% increases fungal disease risk.",
    water: "💧 Irrigate crops during early morning to reduce evaporation. Drip irrigation saves up to 50% water.",
    default: "🤖 My_Agri AI is analyzing your farm data. I recommend checking your soil health and monitoring crop conditions daily for best results.",
};

const getFallbackResponse = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('soil') || msg.includes('ph') || msg.includes('nutrient')) return FALLBACK_RESPONSES.soil;
    if (msg.includes('disease') || msg.includes('pest') || msg.includes('blight')) return FALLBACK_RESPONSES.disease;
    if (msg.includes('price') || msg.includes('market') || msg.includes('sell')) return FALLBACK_RESPONSES.market;
    if (msg.includes('weather') || msg.includes('rain') || msg.includes('temperature')) return FALLBACK_RESPONSES.weather;
    if (msg.includes('water') || msg.includes('irrigat')) return FALLBACK_RESPONSES.water;
    return FALLBACK_RESPONSES.default;
};
