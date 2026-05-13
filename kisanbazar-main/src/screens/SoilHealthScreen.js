import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { Droplets, ChevronLeft, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { getSoilData } from '../services/dbService';
import { isConfigured } from '../services/firebase';
import { getCurrentUser } from '../services/auth';

// Simulated IoT sensor fallback
const generateSoilData = () => ({
    moisture: +(40 + Math.random() * 40).toFixed(1),
    ph: +(5.5 + Math.random() * 2.5).toFixed(1),
    temperature: +(18 + Math.random() * 14).toFixed(1),
    nitrogen: Math.round(80 + Math.random() * 120),
    potassium: Math.round(100 + Math.random() * 100),
});

const METRICS = [
    { key: 'moisture', label: 'Moisture', unit: '%', color: theme.colors.secondary, ideal: '40-70%' },
    { key: 'ph', label: 'pH Level', unit: '', color: theme.colors.primary, ideal: '6.0-7.5' },
    { key: 'temperature', label: 'Soil Temp', unit: '°C', color: '#FFB74D', ideal: '20-30°C' },
    { key: 'nitrogen', label: 'Nitrogen', unit: ' mg/kg', color: theme.colors.accent, ideal: '120-200' },
    { key: 'potassium', label: 'Potassium', unit: ' mg/kg', color: '#EF5350', ideal: '150-200' },
];

const SoilHealthScreen = ({ navigation }) => {
    const [soil, setSoil] = useState(generateSoilData());
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [isLive, setIsLive] = useState(false);

    const fetchSoilData = async () => {
        setLoading(true);
        try {
            const user = getCurrentUser();
            const userId = user?.uid || 'demo-user';
            const data = await getSoilData(userId);
            if (data) {
                setSoil(data);
                setIsLive(true);
            } else {
                // Firebase not configured or no data — use simulated sensors
                setSoil(generateSoilData());
                setIsLive(false);
            }
        } catch (e) {
            setSoil(generateSoilData());
            setIsLive(false);
        } finally {
            setLastUpdate(new Date());
            setLoading(false);
        }
    };

    // Load on mount, auto-refresh every 10s
    useEffect(() => {
        fetchSoilData();
        const interval = setInterval(fetchSoilData, 10000);
        return () => clearInterval(interval);
    }, []);

    const healthScore = Math.round(
        (soil.moisture >= 40 && soil.moisture <= 70 ? 25 : 10) +
        (soil.ph >= 6 && soil.ph <= 7.5 ? 25 : 10) +
        (soil.nitrogen >= 120 ? 25 : soil.nitrogen >= 80 ? 15 : 5) +
        (soil.potassium >= 150 ? 25 : soil.potassium >= 100 ? 15 : 5)
    );

    const getAdvice = () => {
        const issues = [];
        if (soil.ph < 6) issues.push('Soil is acidic (pH ' + soil.ph + '). Apply agricultural lime.');
        if (soil.ph > 7.5) issues.push('Soil is alkaline. Add sulfur or organic compost.');
        if (soil.moisture < 40) issues.push('Low moisture (' + soil.moisture + '%). Increase irrigation.');
        if (soil.moisture > 70) issues.push('Excess moisture. Improve drainage to prevent root rot.');
        if (soil.nitrogen < 120) issues.push('Low nitrogen (' + soil.nitrogen + ' mg/kg). Apply urea or compost.');
        if (soil.potassium < 150) issues.push('Low potassium. Apply potash fertilizer.');
        return issues.length > 0 ? issues.join('\n') : 'All soil parameters are optimal. Continue current practices.';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>Soil Intelligence</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isLive
                        ? <Wifi color={theme.colors.primary} size={16} style={{ marginRight: 8 }} />
                        : <WifiOff color={theme.colors.textMuted} size={16} style={{ marginRight: 8 }} />
                    }
                    <Pressable onPress={fetchSoilData} style={styles.refreshBtn}>
                        {loading ? <ActivityIndicator color={theme.colors.primary} size="small" /> : <RefreshCw color={theme.colors.primary} size={18} />}
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Live badge */}
                <View style={[styles.liveBadge, { backgroundColor: isLive ? `${theme.colors.primary}18` : 'rgba(255,255,255,0.04)' }]}>
                    <View style={[styles.liveDot, { backgroundColor: isLive ? theme.colors.primary : theme.colors.textMuted }]} />
                    <Text style={[styles.liveText, { color: isLive ? theme.colors.primary : theme.colors.textMuted }]}>
                        {isLive ? '● LIVE Firebase Sensor' : '● Simulated Sensor (Demo)'}
                    </Text>
                </View>

                {/* Score Card */}
                <GlassCard style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Soil Health Score</Text>
                    <Text style={styles.scoreValue}>{healthScore}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                    <View style={[styles.scoreBadge, { backgroundColor: healthScore > 70 ? `${theme.colors.primary}20` : `${theme.colors.error}20` }]}>
                        <Text style={[styles.scoreStatus, { color: healthScore > 70 ? theme.colors.primary : theme.colors.error }]}>
                            {healthScore > 70 ? '✅ Optimal' : healthScore > 50 ? '⚠️ Moderate' : '❌ Poor'}
                        </Text>
                    </View>
                    <Text style={styles.lastUpdate}>Last read: {lastUpdate.toLocaleTimeString()}</Text>
                </GlassCard>

                <Text style={styles.sectionTitle}>Live Sensor Readings</Text>
                <View style={styles.metricsGrid}>
                    {METRICS.map(m => (
                        <GlassCard key={m.key} style={styles.metricCard}>
                            <Droplets color={m.color} size={20} />
                            <Text style={styles.metricValue}>{soil[m.key]}{m.unit}</Text>
                            <Text style={styles.metricLabel}>{m.label}</Text>
                            <Text style={styles.metricIdeal}>Ideal: {m.ideal}</Text>
                        </GlassCard>
                    ))}
                </View>

                <GlassCard style={styles.advice}>
                    <Text style={styles.adviceTitle}>🌱 AI Recommendations</Text>
                    <Text style={styles.adviceText}>{getAdvice()}</Text>
                </GlassCard>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 16 },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginLeft: 16, flex: 1 },
    refreshBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
    liveDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
    liveText: { fontSize: 12, fontWeight: '700' },
    content: { padding: 20 },
    scoreCard: { alignItems: 'center', paddingVertical: 32, marginBottom: 24 },
    scoreLabel: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
    scoreValue: { fontSize: 72, fontWeight: '900', color: theme.colors.primary },
    scoreMax: { fontSize: 20, color: theme.colors.textMuted, marginTop: -8 },
    scoreBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
    scoreStatus: { fontSize: 14, fontWeight: '700' },
    lastUpdate: { color: theme.colors.textMuted, fontSize: 11, marginTop: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    metricCard: { width: '47%', marginBottom: 16, alignItems: 'flex-start', padding: 16 },
    metricValue: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginTop: 8 },
    metricLabel: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4, fontWeight: '600' },
    metricIdeal: { fontSize: 10, color: theme.colors.textMuted, marginTop: 4, opacity: 0.6 },
    advice: { padding: 20 },
    adviceTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 },
    adviceText: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 22 },
});

export default SoilHealthScreen;
