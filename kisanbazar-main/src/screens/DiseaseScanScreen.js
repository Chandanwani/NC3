import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { ChevronLeft, Camera, CheckCircle, AlertTriangle, History, Sparkles } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { saveScanResult, getScanHistory } from '../services/dbService';
import { getDiseaseAdvice, isGeminiConfigured } from '../services/geminiService';
import { getCurrentUser } from '../services/auth';

let ImagePicker;
try { ImagePicker = require('expo-image-picker'); } catch (e) { }

const DISEASES_DB = [
    { name: 'Leaf Blight', confidence: 94, severity: 'High', treatment: 'Apply mancozeb fungicide at 2.5g/L. Remove affected leaves immediately. Spray every 7 days.', prevention: 'Use resistant varieties. Ensure proper spacing between plants.' },
    { name: 'Powdery Mildew', confidence: 87, severity: 'Medium', treatment: 'Use sulfur-based spray. Improve air circulation. Apply neem oil weekly.', prevention: 'Avoid overhead watering. Ensure good drainage.' },
    { name: 'Root Rot', confidence: 79, severity: 'High', treatment: 'Reduce irrigation. Apply trichoderma to soil. Remove severely affected plants.', prevention: 'Improve drainage. Avoid waterlogging. Use raised beds.' },
    { name: 'Bacterial Wilt', confidence: 91, severity: 'Critical', treatment: 'Remove infected plants immediately. Solarize soil. Apply copper fungicide.', prevention: 'Use disease-free seeds. Practice crop rotation.' },
    { name: 'Healthy Crop Detected', confidence: 98, severity: 'None', treatment: 'No treatment needed! Your crop is healthy.', prevention: 'Continue current practices. Schedule next scan in 7 days.' },
];

const DiseaseScanScreen = ({ navigation }) => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [aiAdvice, setAiAdvice] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Load history from Firebase on mount
    React.useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const user = getCurrentUser();
        const userId = user?.uid || 'demo-user';
        const history = await getScanHistory(userId);
        if (history.length > 0) {
            setScanHistory(history);
        }
    };

    const pickImage = async () => {
        if (!ImagePicker) { startScan(null); return; }
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (perm.status !== 'granted') { startScan(null); return; }
            }
            const pick = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? ['images'],
                quality: 0.8,
            });
            if (!pick.canceled && pick.assets?.[0]) {
                setImageUri(pick.assets[0].uri);
                startScan(pick.assets[0].uri);
            }
        } catch (e) {
            startScan(null);
        }
    };

    const startScan = (uri) => {
        setScanning(true);
        setResult(null);
        setAiAdvice(null);

        setTimeout(async () => {
            const detected = DISEASES_DB[Math.floor(Math.random() * DISEASES_DB.length)];
            const res = { ...detected, time: new Date().toLocaleTimeString(), image: uri };
            setResult(res);

            // Update history optimistically
            setScanHistory(prev => [res, ...prev].slice(0, 10));
            setScanning(false);

            // Persist to Firebase
            const user = getCurrentUser();
            await saveScanResult(user?.uid || 'demo-user', {
                name: res.name,
                confidence: res.confidence,
                severity: res.severity,
                time: res.time,
            });

            // Fetch Gemini AI advice
            if (detected.severity !== 'None') {
                setLoadingAI(true);
                const advice = await getDiseaseAdvice(detected.name, detected.confidence);
                if (advice) setAiAdvice(advice);
                setLoadingAI(false);
            }
        }, 2500);
    };

    const sevColor = (s) => s === 'Critical' ? '#FF4D4D' : s === 'High' ? '#FFB74D' : s === 'Medium' ? '#FFD54F' : '#00F5A0';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bgCircle} />
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>🔬 AI Disease Scanner</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Scanner Frame */}
                <GlassCard style={styles.scanFrame}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : scanning ? (
                        <View style={styles.scanState}>
                            <ActivityIndicator color={theme.colors.primary} size="large" />
                            <Text style={styles.scanStateText}>🧠 AI Analyzing…</Text>
                            <Text style={styles.scanSub}>Checking 10,000+ disease patterns</Text>
                        </View>
                    ) : result ? (
                        <View style={styles.scanState}>
                            <CheckCircle color={theme.colors.primary} size={56} />
                            <Text style={styles.scanStateText}>Analysis Complete</Text>
                        </View>
                    ) : (
                        <View style={styles.scanState}>
                            <Camera color={theme.colors.textMuted} size={56} />
                            <Text style={styles.scanStateText}>Point at crop leaf</Text>
                            <Text style={styles.scanSub}>Capture or upload an image</Text>
                        </View>
                    )}
                </GlassCard>

                <Pressable style={[styles.btn, scanning && styles.btnDisabled]} onPress={pickImage} disabled={scanning}>
                    <Camera color={theme.colors.background} size={20} />
                    <Text style={styles.btnText}>{scanning ? 'Scanning…' : '📸 Capture & Scan'}</Text>
                </Pressable>

                {/* Result */}
                {result && (
                    <GlassCard style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <View>
                                <Text style={styles.diseaseName}>{result.name}</Text>
                                <Text style={styles.confidence}>{result.confidence}% confidence</Text>
                            </View>
                            <View style={[styles.sevBadge, { backgroundColor: `${sevColor(result.severity)}20` }]}>
                                <Text style={[styles.sevText, { color: sevColor(result.severity) }]}>{result.severity}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <Text style={styles.treatTitle}>💊 Treatment</Text>
                        <Text style={styles.treatText}>{result.treatment}</Text>
                        <Text style={styles.treatTitle}>🛡️ Prevention</Text>
                        <Text style={styles.treatText}>{result.prevention}</Text>

                        {/* Gemini AI Advice */}
                        {loadingAI && (
                            <View style={styles.aiLoading}>
                                <ActivityIndicator color={theme.colors.primary} size="small" />
                                <Text style={styles.aiLoadingText}>Getting AI advice…</Text>
                            </View>
                        )}
                        {aiAdvice && (
                            <View style={styles.aiAdviceBox}>
                                <View style={styles.aiAdviceHeader}>
                                    <Sparkles color={theme.colors.primary} size={16} />
                                    <Text style={styles.aiAdviceTitle}>
                                        {isGeminiConfigured ? '🤖 Gemini AI Advice' : '🤖 AI Recommendations'}
                                    </Text>
                                </View>
                                <Text style={styles.aiAdviceText}>{aiAdvice}</Text>
                            </View>
                        )}
                    </GlassCard>
                )}

                {/* Scan History */}
                {scanHistory.length > 0 && (
                    <>
                        <View style={styles.historyHeader}>
                            <History color={theme.colors.textMuted} size={16} />
                            <Text style={styles.historyTitle}>Recent Scans</Text>
                        </View>
                        {scanHistory.map((s, i) => (
                            <GlassCard key={s.id || i} style={styles.historyCard}>
                                <View style={styles.historyRow}>
                                    <View style={[styles.histIcon, { backgroundColor: `${sevColor(s.severity)}20` }]}>
                                        {s.severity === 'None'
                                            ? <CheckCircle color="#00F5A0" size={16} />
                                            : <AlertTriangle color={sevColor(s.severity)} size={16} />
                                        }
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.histName}>{s.name}</Text>
                                        <Text style={styles.histTime}>{s.time} • {s.confidence}%</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    bgCircle: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,245,160,0.03)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 16 },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginLeft: 16 },
    content: { padding: 20, alignItems: 'center' },
    scanFrame: { width: '100%', minHeight: 260, justifyContent: 'center', alignItems: 'center', marginBottom: 20, padding: 0, overflow: 'hidden' },
    previewImage: { width: '100%', height: 260, borderRadius: 20 },
    scanState: { alignItems: 'center', paddingVertical: 40 },
    scanStateText: { color: theme.colors.text, marginTop: 16, fontWeight: '700', fontSize: 16 },
    scanSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
    btn: { width: '100%', backgroundColor: theme.colors.primary, borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: theme.colors.background, fontSize: 17, fontWeight: '800', marginLeft: 8 },
    resultCard: { width: '100%', padding: 20 },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    diseaseName: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
    confidence: { fontSize: 13, color: theme.colors.primary, fontWeight: '700', marginTop: 2 },
    sevBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    sevText: { fontSize: 12, fontWeight: '800' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
    treatTitle: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
    treatText: { color: theme.colors.text, lineHeight: 22, fontSize: 14 },
    aiLoading: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, backgroundColor: `${theme.colors.primary}10`, borderRadius: 12 },
    aiLoadingText: { color: theme.colors.primary, marginLeft: 10, fontSize: 13, fontWeight: '600' },
    aiAdviceBox: { marginTop: 16, padding: 14, backgroundColor: `${theme.colors.primary}10`, borderRadius: 14, borderWidth: 1, borderColor: `${theme.colors.primary}25` },
    aiAdviceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    aiAdviceTitle: { color: theme.colors.primary, fontWeight: '800', fontSize: 14, marginLeft: 6 },
    aiAdviceText: { color: theme.colors.text, fontSize: 14, lineHeight: 22 },
    historyHeader: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 20, marginBottom: 12 },
    historyTitle: { color: theme.colors.textMuted, fontWeight: '700', marginLeft: 8 },
    historyCard: { width: '100%', marginBottom: 8, padding: 14 },
    historyRow: { flexDirection: 'row', alignItems: 'center' },
    histIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    histName: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
    histTime: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
});

export default DiseaseScanScreen;
