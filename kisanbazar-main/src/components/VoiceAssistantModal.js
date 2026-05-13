import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Animated, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { Mic, X, Send, Volume2, MicOff, Globe, Sparkles } from 'lucide-react-native';
import { askGemini, isGeminiConfigured } from '../services/geminiService';

let Speech;
try { Speech = require('expo-speech'); } catch (e) { }

const LANGUAGES = [
    { code: 'en', label: 'EN', speech: 'en-IN', name: 'English' },
    { code: 'hi', label: 'HI', speech: 'hi-IN', name: 'हिन्दी' },
    { code: 'mr', label: 'MR', speech: 'mr-IN', name: 'मराठी' },
    { code: 'te', label: 'TE', speech: 'te-IN', name: 'తెలుగు' },
    { code: 'ta', label: 'TA', speech: 'ta-IN', name: 'தமிழ்' },
    { code: 'kn', label: 'KN', speech: 'kn-IN', name: 'ಕನ್ನಡ' },
    { code: 'bn', label: 'BN', speech: 'bn-IN', name: 'বাংলা' },
    { code: 'gu', label: 'GU', speech: 'gu-IN', name: 'ગુજરાતી' },
    { code: 'pa', label: 'PA', speech: 'pa-IN', name: 'ਪੰਜਾਬੀ' },
];

const RESPONSES = {
    en: {
        soil: '🌱 Your soil health is good. pH is 6.8 and moisture is at 65 percent. No immediate action needed.',
        weather: '☀️ Current temperature in Pune is around 28 degrees Celsius with 72 percent humidity. Light rain expected in 48 hours.',
        market: '📈 Wheat is up 2.3 percent. Tomato prices surging at 4.5 percent. Good time to sell tomatoes.',
        disease: '🔬 No active disease alerts. Last scan was clean. Schedule another scan this week.',
        price: '💰 Wheat 2140 rupees per quintal. Rice 1950. Tomato 28 rupees per kg.',
        hello: '👋 Hello! I am your My Agri AI assistant. How can I help you today?',
        hi: '👋 Hi there! Ask me about soil, weather, market, disease, or crops.',
        help: '🤖 I can help with soil, weather, market, disease, crop, irrigation, fertilizer, and predictions.',
        crop: '🌾 For Pune weather, consider wheat, soybean, or jowar this season.',
        irrigation: '💧 Soil moisture is moderate. Irrigate early morning between 5 and 7 AM.',
        fertilizer: '🧪 Apply 120 kg nitrogen and 60 kg potassium per hectare this cycle.',
        predict: '🔮 Wheat yield expected at 82 percent. Tomato prices will rise 5 percent next week.',
        analytics: '📊 Average temp 28 degrees, humidity 65 percent. 3 rain days expected. Sowing window is now.',
    },
    hi: {
        soil: '🌱 आपकी मिट्टी की सेहत अच्छी है। pH 6.8 है और नमी 65 प्रतिशत है। अभी कोई कार्रवाई जरूरी नहीं।',
        weather: '☀️ पुणे में तापमान लगभग 28 डिग्री सेल्सियस है, नमी 72 प्रतिशत। 48 घंटों में हल्की बारिश की संभावना।',
        market: '📈 गेहूं 2.3 प्रतिशत ऊपर है। टमाटर की कीमतें 4.5 प्रतिशत बढ़ी हैं। बेचने का अच्छा समय है।',
        disease: '🔬 कोई रोग चेतावनी नहीं। पिछली जांच साफ थी। इस हफ्ते दोबारा जांच करें।',
        price: '💰 गेहूं 2140 रुपये प्रति क्विंटल। चावल 1950। टमाटर 28 रुपये प्रति किलो।',
        hello: '👋 नमस्ते! मैं आपका माय एग्री AI सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
        hi: '👋 नमस्ते! मिट्टी, मौसम, बाजार, रोग, या फसल के बारे में पूछें।',
        help: '🤖 मैं मिट्टी, मौसम, बाजार, रोग, फसल, सिंचाई, उर्वरक और भविष्यवाणी में मदद कर सकता हूँ।',
        crop: '🌾 पुणे के मौसम के लिए गेहूं, सोयाबीन या ज्वार की खेती करें।',
        irrigation: '💧 मिट्टी की नमी मध्यम है। सुबह 5 से 7 बजे के बीच सिंचाई करें।',
        fertilizer: '🧪 इस चक्र में प्रति हेक्टेयर 120 किलो नाइट्रोजन और 60 किलो पोटेशियम डालें।',
        predict: '🔮 गेहूं की उपज 82 प्रतिशत अपेक्षित है। अगले हफ्ते टमाटर की कीमतें 5 प्रतिशत बढ़ेंगी।',
        analytics: '📊 औसत तापमान 28 डिग्री, नमी 65 प्रतिशत। 3 बारिश के दिन अपेक्षित। बुवाई का सही समय अभी है।',
    },
    mr: {
        soil: '🌱 तुमच्या मातीचे आरोग्य चांगले आहे। pH 6.8 आहे आणि ओलावा 65 टक्के आहे. सध्या कोणतीही कारवाई आवश्यक नाही.',
        weather: '☀️ पुण्यात तापमान सुमारे 28 अंश सेल्सिअस आहे, आर्द्रता 72 टक्के. 48 तासांत हलका पाऊस अपेक्षित.',
        market: '📈 गहू 2.3 टक्क्यांनी वर आहे. टोमॅटोचे भाव 4.5 टक्क्यांनी वाढले. विकण्याची चांगली वेळ.',
        disease: '🔬 कोणताही रोग इशारा नाही. शेवटची तपासणी स्वच्छ होती. या आठवड्यात पुन्हा तपासणी करा.',
        price: '💰 गहू 2140 रुपये प्रति क्विंटल. तांदूळ 1950. टोमॅटो 28 रुपये प्रति किलो.',
        hello: '👋 नमस्कार! मी तुमचा माय एग्री AI सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो?',
        hi: '👋 नमस्कार! माती, हवामान, बाजार, रोग किंवा पिकांबद्दल विचारा.',
        help: '🤖 मी माती, हवामान, बाजार, रोग, पीक, सिंचन, खत आणि भविष्यवाणीत मदत करू शकतो.',
        crop: '🌾 पुण्याच्या हवामानासाठी गहू, सोयाबीन किंवा ज्वारी पिकवा.',
        irrigation: '💧 मातीचा ओलावा मध्यम आहे. सकाळी 5 ते 7 दरम्यान सिंचन करा.',
        fertilizer: '🧪 या हंगामात हेक्टरी 120 किलो नायट्रोजन आणि 60 किलो पोटॅशियम द्या.',
        predict: '🔮 गव्हाचे उत्पादन 82 टक्के अपेक्षित. पुढच्या आठवड्यात टोमॅटोचे भाव 5 टक्क्यांनी वाढतील.',
        analytics: '📊 सरासरी तापमान 28 अंश, आर्द्रता 65 टक्के. 3 पावसाचे दिवस अपेक्षित. पेरणीची योग्य वेळ आता आहे.',
    },
    te: {
        soil: '🌱 మీ నేల ఆరోగ్యం బాగుంది. pH 6.8, తేమ 65 శాతం. ప్రస్తుతం చర్య అవసరం లేదు.',
        weather: '☀️ పుణెలో ఉష్ణోగ్రత 28 డిగ్రీల సెల్సియస్, తేమ 72 శాతం. 48 గంటల్లో తేలికపాటి వర్షం.',
        market: '📈 గోధుమ 2.3 శాతం పెరిగింది. టమాటా ధరలు 4.5 శాతం పెరిగాయి. అమ్మడానికి మంచి సమయం.',
        disease: '🔬 వ్యాధి హెచ్చరికలు లేవు. చివరి స్కాన్ సరిగ్గా ఉంది. ఈ వారంలో మళ్ళీ స్కాన్ చేయండి.',
        price: '💰 గోధుమ క్వింటాల్‌కు 2140 రూపాయలు. బియ్యం 1950. టమాటా కిలోకు 28 రూపాయలు.',
        hello: '👋 నమస్కారం! నేను మీ మై అగ్రి AI సహాయకుడిని. నేను ఎలా సహాయం చేయగలను?',
        hi: '👋 హలో! నేల, వాతావరణం, మార్కెట్, వ్యాధి లేదా పంటల గురించి అడగండి.',
        help: '🤖 నేల, వాతావరణం, మార్కెట్, వ్యాధి, పంట, నీటిపారుదల, ఎరువు మరియు అంచనాలలో సహాయం చేయగలను.',
        crop: '🌾 పుణె వాతావరణానికి గోధుమ, సోయాబీన్ లేదా జొన్న పండించండి.',
        irrigation: '💧 నేల తేమ మధ్యస్తంగా ఉంది. ఉదయం 5 నుండి 7 గంటల మధ్య నీరు పెట్టండి.',
        fertilizer: '🧪 హెక్టారుకు 120 కిలోల నైట్రోజన్ మరియు 60 కిలోల పొటాషియం వేయండి.',
        predict: '🔮 గోధుమ దిగుబడి 82 శాతం అంచనా. వచ్చే వారం టమాటా ధరలు 5 శాతం పెరుగుతాయి.',
        analytics: '📊 సగటు ఉష్ణోగ్రత 28 డిగ్రీలు, తేమ 65 శాతం. 3 వర్ష రోజులు. విత్తనాల సమయం ఇప్పుడే.',
    },
    ta: {
        soil: '🌱 உங்கள் மண் ஆரோக்கியம் நன்றாக உள்ளது. pH 6.8, ஈரப்பதம் 65 சதவீதம். நடவடிக்கை தேவையில்லை.',
        weather: '☀️ புனேவில் வெப்பநிலை 28 டிகிரி செல்சியஸ், ஈரப்பதம் 72 சதவீதம். 48 மணி நேரத்தில் லேசான மழை.',
        market: '📈 கோதுமை 2.3 சதவீதம் உயர்ந்தது. தக்காளி விலை 4.5 சதவீதம் உயர்ந்தது. விற்க நல்ல நேரம்.',
        disease: '🔬 நோய் எச்சரிக்கை இல்லை. கடைசி ஸ்கேன் சரியாக உள்ளது. இந்த வாரம் மீண்டும் ஸ்கேன் செய்யுங்கள்.',
        hello: '👋 வணக்கம்! நான் உங்கள் மை அக்ரி AI உதவியாளர். நான் எப்படி உதவ முடியும்?',
        hi: '👋 வணக்கம்! மண், வானிலை, சந்தை, நோய் அல்லது பயிர்கள் பற்றி கேளுங்கள்.',
        help: '🤖 மண், வானிலை, சந்தை, நோய், பயிர், நீர்ப்பாசனம், உரம் மற்றும் கணிப்புகளில் உதவ முடியும்.',
        crop: '🌾 புனே வானிலைக்கு கோதுமை, சோயாபீன் அல்லது சோளம் பயிரிடுங்கள்.',
        predict: '🔮 கோதுமை விளைச்சல் 82 சதவீதம் எதிர்பார்க்கப்படுகிறது.',
        price: '💰 கோதுமை குவிண்டாலுக்கு 2140 ரூபாய். அரிசி 1950. தக்காளி கிலோவுக்கு 28 ரூபாய்.',
        irrigation: '💧 மண் ஈரப்பதம் மிதமானது. காலை 5 முதல் 7 மணி வரை நீர்ப்பாசனம் செய்யுங்கள்.',
        fertilizer: '🧪 ஹெக்டேருக்கு 120 கிலோ நைட்ரஜன் மற்றும் 60 கிலோ பொட்டாசியம் இடுங்கள்.',
        analytics: '📊 சராசரி வெப்பநிலை 28 டிகிரி, ஈரப்பதம் 65%. 3 மழை நாட்கள் எதிர்பார்க்கப்படுகிறது.',
    },
    kn: {
        soil: '🌱 ನಿಮ್ಮ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿದೆ. pH 6.8, ತೇವಾಂಶ 65 ಶೇಕಡ. ಕ್ರಮ ಅಗತ್ಯವಿಲ್ಲ.',
        weather: '☀️ ಪುಣೆಯಲ್ಲಿ ಉಷ್ಣಾಂಶ 28 ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್, ತೇವಾಂಶ 72%. 48 ಗಂಟೆಗಳಲ್ಲಿ ಸಣ್ಣ ಮಳೆ.',
        market: '📈 ಗೋಧಿ 2.3% ಹೆಚ್ಚಾಗಿದೆ. ಟೊಮೆಟೊ ಬೆಲೆ 4.5% ಏರಿಕೆ. ಮಾರಾಟಕ್ಕೆ ಒಳ್ಳೆಯ ಸಮಯ.',
        hello: '👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಮೈ ಅಗ್ರಿ AI ಸಹಾಯಕ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        hi: '👋 ನಮಸ್ಕಾರ! ಮಣ್ಣು, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ, ರೋಗ ಅಥವಾ ಬೆಳೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.',
        help: '🤖 ಮಣ್ಣು, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ, ರೋಗ, ಬೆಳೆ, ನೀರಾವರಿ ಮತ್ತು ಗೊಬ್ಬರದಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.',
        disease: '🔬 ರೋಗ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ. ಕೊನೆಯ ಸ್ಕ್ಯಾನ್ ಸರಿಯಾಗಿದೆ.',
        crop: '🌾 ಪುಣೆ ಹವಾಮಾನಕ್ಕೆ ಗೋಧಿ, ಸೋಯಾಬೀನ್ ಅಥವಾ ಜೋಳ ಬೆಳೆಯಿರಿ.',
        predict: '🔮 ಗೋಧಿ ಇಳುವರಿ 82% ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ.',
        price: '💰 ಗೋಧಿ ಕ್ವಿಂಟಲ್‌ಗೆ 2140 ರೂಪಾಯಿ.',
        irrigation: '💧 ಬೆಳಿಗ್ಗೆ 5 ರಿಂದ 7 ಗಂಟೆ ನಡುವೆ ನೀರಾವರಿ ಮಾಡಿ.',
        fertilizer: '🧪 ಹೆಕ್ಟೇರಿಗೆ 120 ಕಿಲೋ ಸಾರಜನಕ ಹಾಕಿ.',
        analytics: '📊 ಸರಾಸರಿ ಉಷ್ಣಾಂಶ 28 ಡಿಗ್ರಿ. 3 ಮಳೆ ದಿನಗಳು ನಿರೀಕ್ಷಿತ.',
    },
    bn: {
        soil: '🌱 আপনার মাটির স্বাস্থ্য ভালো। pH 6.8, আর্দ্রতা 65%। এখন কোনো পদক্ষেপ দরকার নেই।',
        weather: '☀️ পুনেতে তাপমাত্রা 28 ডিগ্রি, আর্দ্রতা 72%। 48 ঘণ্টায় হালকা বৃষ্টি সম্ভব।',
        market: '📈 গম 2.3% বেড়েছে। টমেটোর দাম 4.5% বেড়েছে। বিক্রি করার ভালো সময়।',
        hello: '👋 নমস্কার! আমি আপনার মাই অ্যাগ্রি AI সহায়ক। কীভাবে সাহায্য করতে পারি?',
        hi: '👋 নমস্কার! মাটি, আবহাওয়া, বাজার, রোগ বা ফসল সম্পর্কে জিগ্যেস করুন।',
        help: '🤖 মাটি, আবহাওয়া, বাজার, রোগ, ফসল, সেচ এবং সার নিয়ে সাহায্য করতে পারি।',
        disease: '🔬 কোনো রোগের সতর্কতা নেই।',
        crop: '🌾 পুনের আবহাওয়ায় গম, সয়াবিন বা জোয়ার চাষ করুন।',
        predict: '🔮 গমের ফলন 82% প্রত্যাশিত।',
        price: '💰 গম প্রতি কুইন্টাল 2140 টাকা।',
        irrigation: '💧 সকাল 5 থেকে 7 এর মধ্যে সেচ দিন।',
        fertilizer: '🧪 হেক্টরে 120 কেজি নাইট্রোজেন দিন।',
        analytics: '📊 গড় তাপমাত্রা 28 ডিগ্রি। 3 বৃষ্টির দিন প্রত্যাশিত।',
    },
    gu: {
        soil: '🌱 તમારી જમીનનું આરોગ્ય સારું છે. pH 6.8, ભેજ 65%. હાલ કોઈ પગલાં જરૂરી નથી.',
        weather: '☀️ પુણેમાં તાપમાન 28 ડિગ્રી, ભેજ 72%. 48 કલાકમાં હળવો વરસાદ.',
        market: '📈 ઘઉં 2.3% વધ્યા. ટામેટાના ભાવ 4.5% વધ્યા. વેચવાનો સારો સમય.',
        hello: '👋 નમસ્તે! હું તમારો માય અગ્રી AI સહાયક છું. હું કેવી રીતે મદદ કરી શકું?',
        hi: '👋 નમસ્તે! જમીન, હવામાન, બજાર, રોગ કે પાક વિશે પૂછો.',
        help: '🤖 જમીન, હવામાન, બજાર, રોગ, પાક, સિંચાઈ અને ખાતરમાં મદદ કરી શકું.',
        disease: '🔬 કોઈ રોગ ચેતવણી નથી.',
        crop: '🌾 પુણેના હવામાન માટે ઘઉં, સોયાબીન અથવા જુવાર ઉગાડો.',
        predict: '🔮 ઘઉંનું ઉત્પાદન 82% અપેક્ષિત.',
        price: '💰 ઘઉં ક્વિન્ટલ દીઠ 2140 રૂપિયા.',
        irrigation: '💧 સવારે 5 થી 7 વચ્ચે સિંચાઈ કરો.',
        fertilizer: '🧪 હેક્ટર દીઠ 120 કિલો નાઇટ્રોજન નાખો.',
        analytics: '📊 સરેરાશ તાપમાન 28 ડિગ્રી. 3 વરસાદના દિવસો અપેક્ષિત.',
    },
    pa: {
        soil: '🌱 ਤੁਹਾਡੀ ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਚੰਗੀ ਹੈ। pH 6.8, ਨਮੀ 65%। ਹੁਣ ਕੋਈ ਕਾਰਵਾਈ ਲੋੜੀਂਦੀ ਨਹੀਂ।',
        weather: '☀️ ਪੁਣੇ ਵਿੱਚ ਤਾਪਮਾਨ 28 ਡਿਗਰੀ, ਨਮੀ 72%। 48 ਘੰਟਿਆਂ ਵਿੱਚ ਹਲਕੀ ਬਾਰਿਸ਼।',
        market: '📈 ਕਣਕ 2.3% ਵਧੀ। ਟਮਾਟਰ ਦੀ ਕੀਮਤ 4.5% ਵਧੀ। ਵੇਚਣ ਦਾ ਵਧੀਆ ਸਮਾਂ।',
        hello: '👋 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਮਾਈ ਐਗਰੀ AI ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
        hi: '👋 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮਿੱਟੀ, ਮੌਸਮ, ਮੰਡੀ, ਬੀਮਾਰੀ ਜਾਂ ਫ਼ਸਲ ਬਾਰੇ ਪੁੱਛੋ।',
        help: '🤖 ਮਿੱਟੀ, ਮੌਸਮ, ਮੰਡੀ, ਬੀਮਾਰੀ, ਫ਼ਸਲ, ਸਿੰਚਾਈ ਅਤੇ ਖਾਦ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।',
        disease: '🔬 ਕੋਈ ਬੀਮਾਰੀ ਚੇਤਾਵਨੀ ਨਹੀਂ।',
        crop: '🌾 ਪੁਣੇ ਦੇ ਮੌਸਮ ਲਈ ਕਣਕ, ਸੋਇਆਬੀਨ ਜਾਂ ਜਵਾਰ ਬੀਜੋ।',
        predict: '🔮 ਕਣਕ ਦਾ ਝਾੜ 82% ਅਨੁਮਾਨਿਤ।',
        price: '💰 ਕਣਕ 2140 ਰੁਪਏ ਪ੍ਰਤੀ ਕੁਇੰਟਲ।',
        irrigation: '💧 ਸਵੇਰੇ 5 ਤੋਂ 7 ਵਜੇ ਸਿੰਚਾਈ ਕਰੋ।',
        fertilizer: '🧪 ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ 120 ਕਿਲੋ ਨਾਈਟ੍ਰੋਜਨ ਪਾਓ।',
        analytics: '📊 ਔਸਤ ਤਾਪਮਾਨ 28 ਡਿਗਰੀ। 3 ਬਾਰਿਸ਼ ਦੇ ਦਿਨ ਅਨੁਮਾਨਿਤ।',
    },
};

const VoiceAssistantModal = ({ visible, onClose }) => {
    const pulse = useRef(new Animated.Value(1)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [lang, setLang] = useState(LANGUAGES[0]);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        if (visible && !speaking) loop.start();
        return () => loop.stop();
    }, [visible, speaking]);

    useEffect(() => {
        if (speaking) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.timing(waveAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [speaking]);

    useEffect(() => {
        if (visible) { setQuery(''); setResponse(''); setListening(false); setSpeaking(false); }
    }, [visible]);

    const startVoiceInput = () => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SR();
            recognition.lang = lang.speech;
            recognition.continuous = false;
            recognition.interimResults = false;
            setListening(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                setListening(false);
                processQuery(transcript);
            };
            recognition.onerror = () => setListening(false);
            recognition.onend = () => setListening(false);
            recognition.start();
        } else {
            alert('Voice input supported on Chrome. Please type your query.');
        }
    };

    const processQuery = async (text, fromVoice = false) => {
        const q = (text || query).trim();
        if (!q) return;

        // Always try keyword match first for instant response (and for voice)
        const qLow = q.toLowerCase();
        const langResponses = RESPONSES[lang.code] || RESPONSES.en;
        const keys = Object.keys(langResponses);
        const match = keys.find(k => qLow.includes(k));

        if (match || fromVoice || lang.code !== 'en') {
            // Use instant multilingual keyword response
            const reply = match ? langResponses[match] : langResponses['help'] || langResponses['hello'];
            setResponse(reply);
            speakResponse(reply);
            return;
        }

        // For typed English queries — call Gemini AI
        setAiLoading(true);
        setResponse('');
        try {
            const aiReply = await askGemini(q);
            setResponse(aiReply);
            speakResponse(aiReply);
        } catch (e) {
            const fallback = langResponses['help'] || langResponses['hello'];
            setResponse(fallback);
            speakResponse(fallback);
        } finally {
            setAiLoading(false);
        }
    };

    const speakResponse = (text) => {
        if (!Speech) return;
        setSpeaking(true);
        const clean = text.replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu, '').trim();
        Speech.speak(clean, {
            language: lang.speech,
            pitch: 1.05,
            rate: 0.85,
            volume: 1.0,
            onDone: () => setSpeaking(false),
            onError: () => setSpeaking(false),
        });
    };

    const handleClose = () => {
        if (Speech) Speech.stop();
        onClose();
    };

    const wave1 = waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
    const wave2 = waveAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <View style={styles.sheetCircle1} />
                    <View style={styles.sheetCircle2} />

                    <Pressable style={styles.closeBtn} onPress={handleClose}>
                        <X color={theme.colors.textMuted} size={24} />
                    </Pressable>

                    <Text style={styles.title}>My_Agri AI</Text>
                    <Text style={styles.subtitle}>🤖 Smart Farm Agent • {lang.name}</Text>

                    {/* Voice Orb */}
                    <View style={styles.orbArea}>
                        {speaking && (
                            <View style={styles.waveBars}>
                                {[wave1, wave2, wave1, wave2, wave1].map((w, i) => (
                                    <Animated.View key={i} style={[styles.waveBar, { opacity: w, height: 12 + i * 6 }]} />
                                ))}
                            </View>
                        )}
                        <Pressable onPress={startVoiceInput}>
                            <Animated.View style={[styles.orb, { transform: [{ scale: pulse }], backgroundColor: listening ? '#FF4D4D' : speaking ? '#00D9F5' : theme.colors.primary }]}>
                                {listening ? <MicOff color="#050B18" size={40} /> : speaking ? <Volume2 color="#050B18" size={40} /> : <Mic color="#050B18" size={40} />}
                            </Animated.View>
                        </Pressable>
                        <Text style={styles.orbStatus}>
                            {listening ? '🎤 Listening…' : speaking ? '🔊 Speaking…' : 'Tap to speak'}
                        </Text>
                    </View>

                    {aiLoading ? (
                        <View style={styles.aiLoadingRow}>
                            <ActivityIndicator color={theme.colors.primary} size="small" />
                            <Text style={styles.aiLoadingText}>
                                {isGeminiConfigured ? '🤖 Gemini AI thinking…' : '🤖 Processing…'}
                            </Text>
                        </View>
                    ) : response ? (
                        <ScrollView style={styles.responseScroll}>
                            <View style={styles.responseBox}>
                                {isGeminiConfigured && (
                                    <View style={styles.aiTag}>
                                        <Sparkles color={theme.colors.primary} size={12} />
                                        <Text style={styles.aiTagText}>Gemini AI</Text>
                                    </View>
                                )}
                                <Text style={styles.responseText}>{response}</Text>
                            </View>
                        </ScrollView>
                    ) : null}

                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder={isGeminiConfigured ? 'Ask anything (Gemini AI)…' : 'Type your question…'}
                            placeholderTextColor={theme.colors.textMuted}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={() => processQuery(query)}
                        />
                        <Pressable style={styles.sendBtn} onPress={() => processQuery(query)} disabled={aiLoading}>
                            {aiLoading
                                ? <ActivityIndicator color="#050B18" size="small" />
                                : <Send color="#050B18" size={18} />
                            }
                        </Pressable>
                    </View>

                    {/* Quick topics */}
                    <View style={styles.chipRow}>
                        {['🌱 Soil', '☁️ Weather', '📈 Market', '🔬 Disease', '🔮 Predict', '🌾 Crop'].map(c => (
                            <Pressable key={c} style={styles.chip} onPress={() => {
                                const kw = c.replace(/^[\S]+ /, '').toLowerCase();
                                setQuery(kw);
                                processQuery(kw);
                            }}>
                                <Text style={styles.chipText}>{c}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Language Selector */}
                    <View style={styles.langSection}>
                        <View style={styles.langHeader}>
                            <Globe color={theme.colors.textMuted} size={14} />
                            <Text style={styles.langTitle}>Language</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {LANGUAGES.map(l => (
                                <Pressable key={l.code} onPress={() => setLang(l)} style={[styles.langChip, lang.code === l.code && styles.langActive]}>
                                    <Text style={[styles.langText, lang.code === l.code && styles.langActiveText]}>{l.label}</Text>
                                    <Text style={[styles.langName, lang.code === l.code && styles.langActiveText]}>{l.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#0D1B2A', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, alignItems: 'center', paddingBottom: 36, overflow: 'hidden', maxHeight: '92%' },
    sheetCircle1: { position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(0,245,160,0.04)' },
    sheetCircle2: { position: 'absolute', bottom: 20, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,217,245,0.03)' },
    closeBtn: { position: 'absolute', top: 20, right: 24, zIndex: 1 },
    title: { fontSize: 26, fontWeight: '900', color: theme.colors.text, marginTop: 4 },
    subtitle: { color: theme.colors.textMuted, marginBottom: 16, fontSize: 13, fontWeight: '600' },
    orbArea: { alignItems: 'center', marginBottom: 16 },
    waveBars: { flexDirection: 'row', alignItems: 'center', height: 40, marginBottom: 8 },
    waveBar: { width: 5, borderRadius: 3, backgroundColor: '#00D9F5', marginHorizontal: 3 },
    orb: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', shadowColor: '#00F5A0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16 },
    orbStatus: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: 10 },
    responseScroll: { maxHeight: 120, width: '100%', marginBottom: 12 },
    responseBox: { backgroundColor: 'rgba(0,245,160,0.08)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(0,245,160,0.15)' },
    responseText: { color: theme.colors.text, fontSize: 14, lineHeight: 22 },
    aiLoadingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${theme.colors.primary}10`, borderRadius: 14, padding: 12, marginBottom: 12 },
    aiLoadingText: { color: theme.colors.primary, marginLeft: 10, fontSize: 13, fontWeight: '600' },
    aiTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    aiTagText: { color: theme.colors.primary, fontSize: 10, fontWeight: '800', marginLeft: 4, textTransform: 'uppercase' },
    inputRow: { flexDirection: 'row', width: '100%', marginBottom: 10 },
    input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 13, color: theme.colors.text, fontSize: 15, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
    sendBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 },
    chip: { backgroundColor: 'rgba(0,245,160,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, margin: 3, borderWidth: 1, borderColor: 'rgba(0,245,160,0.2)' },
    chipText: { color: theme.colors.primary, fontWeight: '700', fontSize: 11 },
    langSection: { width: '100%' },
    langHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    langTitle: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', marginLeft: 6 },
    langChip: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
    langActive: { backgroundColor: 'rgba(0,245,160,0.15)', borderColor: 'rgba(0,245,160,0.4)' },
    langText: { color: theme.colors.textMuted, fontWeight: '800', fontSize: 13 },
    langName: { color: theme.colors.textMuted, fontSize: 9, marginTop: 2 },
    langActiveText: { color: '#00F5A0' },
});

export default VoiceAssistantModal;
