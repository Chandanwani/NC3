from fastapi import FastAPI, APIRouter, Query
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os, logging, uuid, base64
from datetime import datetime, timezone
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ── Gemini Setup ──────────────────────────────────
GEMINI_API_KEY = (
    os.environ.get('GEMINI_API_KEY') or
    os.environ.get('EMERGENT_LLM_KEY') or
    ''
)
gemini_client = None
if GEMINI_API_KEY and not GEMINI_API_KEY.startswith('your_'):
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("[AI] Gemini 2.5 Flash initialized ✅")
    except Exception as e:
        logger.warning(f"[AI] Gemini init failed: {e}")
else:
    logger.warning("[AI] No API key set — running offline mode only")

# ── MongoDB (optional) ───────────────────────────
USE_MONGO = False
db = None
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name   = os.environ.get('DB_NAME', 'cropdoc')
    mongo_client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
    db = mongo_client[db_name]
    USE_MONGO = True
    logger.info("[DB] MongoDB configured")
except Exception as e:
    logger.warning(f"[DB] MongoDB unavailable — using in-memory: {e}")

_sessions_store: dict = {}
_messages_store: dict = {}

app = FastAPI(title="CropDoc AI", version="3.0")
api_router = APIRouter(prefix="/api")

# ── Models ───────────────────────────────────────
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    language: str = "en"

class MessageRequest(BaseModel):
    session_id: str
    text: str = ""
    image_base64: Optional[str] = None
    image_mime: Optional[str] = "image/jpeg"
    language: str = "en"

# Removed offline disease database

# ── ORIGINAL System Prompts (copied exactly) ─────
SYSTEM_EN = """You are an expert agricultural scientist and crop disease specialist. Your role is to:

1. **Identify Crop Diseases**: When a user uploads an image of a crop/plant, carefully analyze the visual symptoms to identify the crop and the disease. Mention the crop and disease name clearly. DO NOT ask the user which crop it is. Your entire analysis and all subsequent answers MUST be based solely on the uploaded image.

2. **Provide Precautions**: After identifying the disease, give detailed precautions to prevent spread and protect other crops.

3. **Detailed Treatment Plan**: Provide a comprehensive treatment plan including:
   - **Inorganic Fertilizers**: Name specific fertilizers (NPK ratios, DAP, Urea, etc.), exact quantity per acre/hectare, and frequency
   - **Chemical Medicines/Fungicides/Insecticides**: Name specific chemicals with concentration (%), dosage per liter of water, spray volume per acre
   - **Spray Schedule**: How many sprays needed, interval between sprays, best time of day to spray
   - **Organic Alternatives**: Bio-agents, neem-based products, compost teas with dosages

4. **Soil & Plant Impact**: For EACH recommended chemical/fertilizer, explain:
   - Effect on soil health (pH, microorganisms, nutrient balance)
   - Effect on plant (uptake, residue period, harvest safety interval)
   - Long-term accumulation risks

5. **Brand Recommendations with Google Links**: For each recommended product, provide a Google search link so the farmer can find the best brand available in their area. Format links as:
   - [Search: Product Name for crop](https://www.google.com/search?q=best+product+name+for+crop+disease+buy+online)
   Example: [Search: Mancozeb fungicide for tomato blight](https://www.google.com/search?q=best+mancozeb+fungicide+for+tomato+blight+buy+online+India)

RESPONSE FORMATTING RULES:
Rule 1: For initial image uploads or requests for general disease analysis, you MUST ALWAYS provide a FULL report including ALL of these sections:
- **Disease Name** (if identified from image or asked by user)
- **Symptoms Observed**
- **Precautions**
- **Treatment Plan**
  - Inorganic/Chemical Options (with exact dosage per acre)
  - Organic Options (with dosage)
  - Spray Schedule (timing, frequency, quantity per acre)
- **Soil & Plant Impact** (for each product recommended)
- **Where to Buy** (Google search links for each product)
- **Prevention Tips**

Rule 2: For follow-up questions or specific queries (e.g., "what is the dosage?", "how to prevent?", "where to buy?"), DO NOT provide the full report. Answer ONLY the specific question asked, concisely and directly, without unnecessary fluff.

IMPORTANT DOSAGE FORMAT:
- Always mention dosage as: "X grams/ml per liter of water, spray Y liters per acre"
- Example: "Mancozeb 75WP: 2.5g per liter of water, spray 200 liters per acre (500 liters per hectare)"
- For fertilizers: "X kg per acre" or "X kg per hectare"

Be thorough, practical, and helpful. Assume the crop type from the image to the best of your ability and DO NOT ask the user to specify the crop. If the image is extremely blurry, you may ask for a clearer image, but never ask "what crop is this". Always prioritize farmer-friendly language.
CRITICAL INSTRUCTION: If the user asks a specific question (e.g. "what are the precautions?", "what is the treatment?", "show all precautions"), you MUST ONLY answer that specific question and DO NOT provide the full report. If it's a general request for analysis without a specific question, you must provide the FULL, EXTENSIVE, and COMPLETE report. Never cut off your answer mid-sentence."""

SYSTEM_HI = """आप एक विशेषज्ञ कृषि वैज्ञानिक और फसल रोग विशेषज्ञ हैं। आपकी भूमिका है:

1. **फसल रोग की पहचान**: जब उपयोगकर्ता फसल/पौधे की तस्वीर अपलोड करे, तो दृश्य लक्षणों का विश्लेषण करके फसल और रोग की पहचान करें। फसल और रोग का नाम स्पष्ट रूप से बताएं। उपयोगकर्ता से यह मत पूछें कि यह कौन सी फसल है। आपका संपूर्ण विश्लेषण और सभी उत्तर केवल अपलोड की गई छवि पर आधारित होने चाहिए।

2. **सावधानियां बताएं**: रोग की पहचान के बाद, प्रसार रोकने के लिए विस्तृत सावधानियां दें।

3. **विस्तृत उपचार योजना**:
   - **अकार्बनिक उर्वरक**: विशिष्ट उर्वरकों के नाम, प्रति एकड़/हेक्टेयर सटीक मात्रा
   - **रासायनिक दवाएं/फफूंदनाशक/कीटनाशक**: रसायनों के नाम, सांद्रता (%), प्रति लीटर पानी में खुराक
   - **छिड़काव अनुसूची**: कितने छिड़काव, अंतराल, सर्वोत्तम समय
   - **जैविक विकल्प**: जैव-एजेंट, नीम उत्पाद, खुराक सहित

4. **मिट्टी और पौधे पर प्रभाव**: प्रत्येक रसायन/उर्वरक के लिए:
   - मिट्टी के स्वास्थ्य पर प्रभाव (pH, सूक्ष्मजीव)
   - पौधे पर प्रभाव (अवशेष अवधि, कटाई अंतराल)

5. **ब्रांड सुझाव Google लिंक के साथ**:
   - [खोजें: उत्पाद](https://www.google.com/search?q=product+buy+online+India)

उत्तर प्रारूपण नियम:
नियम 1: प्रारंभिक तस्वीर अपलोड या सामान्य रोग निदान के लिए, आपको हमेशा नीचे दिए गए सभी अनुभागों के साथ एक पूर्ण रिपोर्ट देनी होगी:
- **रोग का नाम** (यदि पहचाना गया है)
- **देखे गए लक्षण**
- **सावधानियां**
- **उपचार योजना**
  - रासायनिक विकल्प (सटीक खुराक: X ग्राम/मिली प्रति लीटर, प्रति एकड़ Y लीटर)
  - जैविक विकल्प (खुराक सहित)
  - छिड़काव अनुसूची (समय, आवृत्ति, प्रति एकड़ मात्रा)
- **मिट्टी और पौधे पर प्रभाव** (प्रत्येक उत्पाद के लिए)
- **कहां से खरीदें** (प्रत्येक उत्पाद के लिए Google लिंक)
- **बचाव के तरीके**

नियम 2: यदि उपयोगकर्ता कोई विशिष्ट प्रश्न पूछता है (जैसे, "खुराक क्या है?", "बचाव कैसे करें?", "दवा कहां मिलेगी?"), तो पूरी रिपोर्ट न दें। केवल उसी विशिष्ट प्रश्न का संक्षिप्त और सीधा उत्तर दें। अनावश्यक बातें न लिखें।

व्यापक, व्यावहारिक और किसान-अनुकूल भाषा में जवाब दें। अपनी सर्वोत्तम क्षमता से छवि से फसल के प्रकार का अनुमान लगाएं और उपयोगकर्ता से फसल निर्दिष्ट करने के लिए न कहें। यदि छवि बहुत धुंधली है, तो आप एक स्पष्ट छवि के लिए कह सकते हैं, लेकिन कभी भी यह न पूछें कि "यह कौन सी फसल है"।
महत्वपूर्ण निर्देश: यदि उपयोगकर्ता कोई विशिष्ट प्रश्न पूछता है (जैसे, "सावधानियां क्या हैं?"), तो आपको केवल उसी विशिष्ट प्रश्न का उत्तर देना है और पूरी रिपोर्ट नहीं देनी है। यदि यह सामान्य विश्लेषण का अनुरोध है, तो अपना उत्तर पूरा, विस्तृत और पूर्ण दें। अपना उत्तर बीच में कभी न काटें।"""


# ── DB helpers ────────────────────────────────────
async def db_alive():
    if not USE_MONGO: return False
    try:
        await mongo_client.admin.command('ping')
        return True
    except: return False

async def save_session(doc):
    if await db_alive(): await db.chat_sessions.insert_one({**doc})
    else: _sessions_store[doc['id']] = doc

async def list_sessions():
    if await db_alive():
        return await db.chat_sessions.find({}, {'_id':0}).sort('updated_at',-1).to_list(100)
    return sorted(_sessions_store.values(), key=lambda s: s.get('updated_at',''), reverse=True)

async def get_session(sid):
    if await db_alive(): return await db.chat_sessions.find_one({'id':sid},{'_id':0})
    return _sessions_store.get(sid)

async def update_session(sid, updates):
    if await db_alive(): await db.chat_sessions.update_one({'id':sid},{'$set':updates})
    elif sid in _sessions_store: _sessions_store[sid].update(updates)

async def delete_session(sid):
    if await db_alive():
        await db.chat_sessions.delete_one({'id':sid})
        await db.messages.delete_many({'session_id':sid})
    else:
        _sessions_store.pop(sid, None)
        _messages_store.pop(sid, None)

async def save_message(doc):
    if await db_alive(): await db.messages.insert_one({**doc})
    else: _messages_store.setdefault(doc['session_id'], []).append(doc)

async def get_messages(sid):
    if await db_alive():
        return await db.messages.find({'session_id':sid},{'_id':0}).sort('created_at',1).to_list(1000)
    return _messages_store.get(sid, [])


# ── Gemini AI call ────────────────────────────────
async def call_gemini(text: str, image_base64: str | None, image_mime: str, lang: str) -> str:
    import asyncio
    system = SYSTEM_HI if lang == 'hi' else SYSTEM_EN
    prompt_text = text.strip()
    if not prompt_text and image_base64:
        prompt_text = ("कृपया इस फसल की तस्वीर में रोग की पहचान करें और विस्तृत उपचार बताएं।"
                       if lang == 'hi' else
                       "Please analyze this crop/plant image, identify the disease, and provide detailed treatment.")

    if not gemini_client:
        return "⚠️ **AI Offline Mode:** No valid GEMINI_API_KEY provided."

    from google.genai import types
    if image_base64:
        img_bytes = base64.b64decode(image_base64)
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt_text,
                types.Part.from_bytes(data=img_bytes, mime_type=image_mime or "image/jpeg")
            ],
            config=types.GenerateContentConfig(
                temperature=0.3, 
                max_output_tokens=8192,
                system_instruction=system
            )
        ))
    else:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                temperature=0.3, 
                max_output_tokens=8192,
                system_instruction=system
            )
        ))

    return response.text


# ── Routes ────────────────────────────────────────
@api_router.get("/")
async def root():
    mode = "Gemini 2.5 Flash" if gemini_client else "No AI key configured"
    return {"message": "CropDoc AI API", "mode": mode, "status": "online"}

@api_router.post("/chat/sessions")
async def create_session(data: ChatSessionCreate):
    now = datetime.now(timezone.utc).isoformat()
    doc = {"id": str(uuid.uuid4()), "title": data.title, "language": data.language,
           "created_at": now, "updated_at": now}
    await save_session(doc)
    return doc

@api_router.get("/chat/sessions")
async def list_sess():
    return await list_sessions()

@api_router.delete("/chat/sessions/{session_id}")
async def delete_sess(session_id: str):
    await delete_session(session_id)
    return {"status": "deleted"}

@api_router.get("/chat/sessions/{session_id}/messages")
async def get_msgs(session_id: str):
    msgs = await get_messages(session_id)
    return [{k: v for k, v in m.items() if k != '_id'} for m in msgs]

@api_router.post("/chat/send")
async def send_message(data: MessageRequest):
    now = datetime.now(timezone.utc).isoformat()
    lang = data.language or "en"

    # Save user message (truncate large base64 for DB)
    user_doc = {
        "id": str(uuid.uuid4()), "session_id": data.session_id,
        "role": "user", "text": data.text,
        "image_base64": (data.image_base64[:200] + "...") if data.image_base64 and len(data.image_base64) > 200 else data.image_base64,
        "created_at": now
    }
    await save_message(user_doc)

    ai_text = ""

    if not gemini_client:
        ai_text = ("⚠️ **AI not configured.** Please add your `GEMINI_API_KEY` to `backend/.env` and restart the server.\n\n"
                   "Get a free key at: https://aistudio.google.com/app/apikey"
                   if lang == 'en' else
                   "⚠️ **AI सेट नहीं है।** कृपया `backend/.env` में `GEMINI_API_KEY` डालें और server पुनः शुरू करें।\n\n"
                   "Free key यहाँ से लें: https://aistudio.google.com/app/apikey")
    else:
        try:
            ai_text = await call_gemini(data.text, data.image_base64, data.image_mime or "image/jpeg", lang)
            logger.info(f"[AI] Gemini responded ({len(ai_text)} chars)")
        except Exception as e:
            logger.error(f"[AI] Gemini error: {e}")
            error_str = str(e).lower()
            if "quota" in error_str or "429" in error_str or "404" in error_str or "not found" in error_str:
                ai_text = ("⚠️ **AI is extremely busy right now due to free-tier quota limits.**\n\nPlease wait a minute and try again."
                           if lang == 'en' else
                           "⚠️ **कोटा सीमा के कारण AI अभी बहुत व्यस्त है।**\n\nकृपया एक मिनट प्रतीक्षा करें और पुनः प्रयास करें।")
            else:
                ai_text = (f"⚠️ **AI Error:** {str(e)}\n\nPlease try again or check your API key."
                           if lang == 'en' else
                           f"⚠️ **AI त्रुटि:** {str(e)}\n\nकृपया पुनः प्रयास करें या API key जांचें।")

    # Save AI response
    ai_now = datetime.now(timezone.utc).isoformat()
    ai_doc = {"id": str(uuid.uuid4()), "session_id": data.session_id,
              "role": "assistant", "text": ai_text, "image_base64": None, "created_at": ai_now}
    await save_message(ai_doc)

    # Update session title
    session = await get_session(data.session_id)
    if session:
        updates = {"updated_at": ai_now}
        if session.get("title") in ("New Chat", "", None):
            updates["title"] = (data.text[:50] if data.text.strip()
                                else ("Image Analysis" if lang == "en" else "तस्वीर विश्लेषण"))
        await update_session(data.session_id, updates)

    return {k: v for k, v in ai_doc.items() if k != '_id'}



app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
