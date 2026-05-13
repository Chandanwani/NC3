import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { AlertTriangle, ChevronLeft, Truck, RefreshCw, MapPin, Navigation, Wifi, WifiOff } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { subscribeSupplyChain } from '../services/dbService';
import { isConfigured } from '../services/firebase';

const ROUTES = [
    { name: 'NH-48 Pune → Mumbai', dest: 'Mumbai APMC', distance: '165 km', risk: 'low', eta: '3h 20m' },
    { name: 'NH-65 Pune → Solapur', dest: 'Solapur Mandi', distance: '260 km', risk: 'medium', eta: '5h 10m' },
    { name: 'NH-60 Pune → Nashik', dest: 'Nashik Wholesale', distance: '210 km', risk: 'high', eta: '4h 45m' },
];

const ALERTS_POOL = [
    'NH-48: Heavy traffic near Lonavala Ghat. 40 min delay expected.',
    'NH-65: Road construction at Indapur bypass active until March 15.',
    'NH-60: Rainfall warning on Kasara Ghat — exercise caution.',
    'Fuel prices up 2.1% in Pune region — optimize route planning.',
    'Cold storage at Pune APMC operating at 88% — book slots early.',
    'NH-48 Express Lane: Open for commercial vehicles after 10 PM.',
];

const SupplyChainScreen = ({ navigation }) => {
    const [riskIndex, setRiskIndex] = useState(58);
    const [alerts, setAlerts] = useState([ALERTS_POOL[0], ALERTS_POOL[1]]);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(false);

    const refreshSimulated = () => {
        setRiskIndex(Math.round(30 + Math.random() * 50));
        const shuffled = [...ALERTS_POOL].sort(() => 0.5 - Math.random());
        setAlerts(shuffled.slice(0, 2));
    };

    useEffect(() => {
        // Subscribe to Firebase real-time logistics
        const unsubscribe = subscribeSupplyChain((data) => {
            if (data) {
                setRiskIndex(data.index ?? 58);
                const fbAlerts = [];
                if (data.alert) fbAlerts.push(data.alert);
                if (data.alertB) fbAlerts.push(data.alertB);
                setAlerts(fbAlerts.length > 0 ? fbAlerts : [ALERTS_POOL[0], ALERTS_POOL[1]]);
                setIsLive(true);
            }
        });

        // Fallback simulated refresh every 12s
        let interval;
        if (!isConfigured) {
            interval = setInterval(refreshSimulated, 12000);
        }

        return () => {
            unsubscribe();
            if (interval) clearInterval(interval);
        };
    }, []);

    const riskColor = riskIndex > 70 ? '#FF4D4D' : riskIndex > 40 ? '#FFB74D' : '#00F5A0';
    const riskLabel = riskIndex > 70 ? 'HIGH' : riskIndex > 40 ? 'MODERATE' : 'LOW';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bgCircle} />
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>🚛 Logistics Hub</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isLive
                        ? <Wifi color={theme.colors.primary} size={16} style={{ marginRight: 8 }} />
                        : <WifiOff color={theme.colors.textMuted} size={16} style={{ marginRight: 8 }} />
                    }
                    <Pressable onPress={refreshSimulated} style={styles.refreshBtn}>
                        <RefreshCw color={theme.colors.primary} size={18} />
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Live Badge */}
                <View style={[styles.liveBadge, { backgroundColor: isLive ? `${theme.colors.primary}12` : 'rgba(255,255,255,0.04)' }]}>
                    <View style={[styles.liveDot, { backgroundColor: isLive ? theme.colors.primary : theme.colors.textMuted }]} />
                    <Text style={[styles.liveText, { color: isLive ? theme.colors.primary : theme.colors.textMuted }]}>
                        {isLive ? '● LIVE Firebase Risk Data' : '● Simulated Risk Data (Demo)'}
                    </Text>
                </View>

                {/* Risk Gauge */}
                <GlassCard style={styles.gaugeCard}>
                    <Text style={styles.gaugeLabel}>AGGREGATE RISK INDEX</Text>
                    <View style={styles.gaugeBarBg}>
                        <View style={[styles.gaugeBarFill, { width: `${riskIndex}%`, backgroundColor: riskColor }]} />
                    </View>
                    <View style={styles.gaugeFooter}>
                        <View style={[styles.riskBadge, { backgroundColor: `${riskColor}20` }]}>
                            <Text style={[styles.riskBadgeText, { color: riskColor }]}>{riskLabel} RISK</Text>
                        </View>
                        <Text style={[styles.riskScore, { color: riskColor }]}>{riskIndex}/100</Text>
                    </View>
                </GlassCard>

                {/* Map Visualization */}
                <Text style={styles.sectionTitle}>📍 Route Map — Pune Region</Text>
                <GlassCard style={styles.mapCard}>
                    <View style={styles.mapArea}>
                        <View style={styles.mapBg}>
                            <View style={[styles.mapNode, styles.originNode, { left: '40%', top: '45%' }]}>
                                <MapPin color="#00F5A0" size={20} />
                            </View>
                            <Text style={[styles.mapLabel, { left: '28%', top: '60%' }]}>📍 Akurdi, Pune</Text>

                            <View style={[styles.routeLine, { left: '48%', top: '30%', width: 80, transform: [{ rotate: '-45deg' }] }]} />
                            <View style={[styles.mapNode, { left: '72%', top: '15%' }]}>
                                <Navigation color="#00D9F5" size={14} />
                            </View>
                            <Text style={[styles.mapLabel, { left: '62%', top: '5%', color: '#00D9F5' }]}>Mumbai</Text>

                            <View style={[styles.routeLine, { left: '52%', top: '50%', width: 90, transform: [{ rotate: '20deg' }] }]} />
                            <View style={[styles.mapNode, { left: '82%', top: '55%' }]}>
                                <Navigation color="#FFB74D" size={14} />
                            </View>
                            <Text style={[styles.mapLabel, { left: '72%', top: '65%', color: '#FFB74D' }]}>Solapur</Text>

                            <View style={[styles.routeLine, { left: '42%', top: '32%', width: 70, transform: [{ rotate: '-75deg' }] }]} />
                            <View style={[styles.mapNode, { left: '25%', top: '10%' }]}>
                                <Navigation color="#FF4D4D" size={14} />
                            </View>
                            <Text style={[styles.mapLabel, { left: '12%', top: '0%', color: '#FF4D4D' }]}>Nashik</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Alerts */}
                <Text style={styles.sectionTitle}>⚠️ Live Alerts</Text>
                {alerts.map((alert, i) => (
                    <GlassCard key={i} style={styles.alertCard}>
                        <View style={styles.alertRow}>
                            <AlertTriangle color="#FFB74D" size={16} />
                            <Text style={styles.alertText}>{alert}</Text>
                        </View>
                    </GlassCard>
                ))}

                {/* Routes */}
                <Text style={styles.sectionTitle}>🛣️ Active Routes</Text>
                {ROUTES.map((route, i) => (
                    <GlassCard key={i} style={styles.routeCard}>
                        <View style={styles.routeHeader}>
                            <Truck color={theme.colors.textMuted} size={18} />
                            <Text style={styles.routeName}>{route.name}</Text>
                            <View style={[styles.routeRisk, { backgroundColor: `${route.risk === 'high' ? '#FF4D4D' : route.risk === 'medium' ? '#FFB74D' : '#00F5A0'}20` }]}>
                                <Text style={[styles.routeRiskText, { color: route.risk === 'high' ? '#FF4D4D' : route.risk === 'medium' ? '#FFB74D' : '#00F5A0' }]}>
                                    {route.risk.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.routeStats}>
                            <View style={styles.routeStat}><Text style={styles.routeStatVal}>{route.distance}</Text><Text style={styles.routeStatLabel}>Distance</Text></View>
                            <View style={styles.routeStat}><Text style={styles.routeStatVal}>{route.eta}</Text><Text style={styles.routeStatLabel}>ETA</Text></View>
                            <View style={styles.routeStat}><Text style={styles.routeStatVal}>{route.dest}</Text><Text style={styles.routeStatLabel}>Destination</Text></View>
                        </View>
                    </GlassCard>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    bgCircle: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,77,77,0.03)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 16 },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginLeft: 16, flex: 1 },
    refreshBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
    liveDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
    liveText: { fontSize: 12, fontWeight: '700' },
    content: { padding: 20 },
    gaugeCard: { padding: 24, marginBottom: 20 },
    gaugeLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 16 },
    gaugeBarBg: { height: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 7, overflow: 'hidden', marginBottom: 16 },
    gaugeBarFill: { height: 14, borderRadius: 7 },
    gaugeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    riskBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
    riskBadgeText: { fontSize: 12, fontWeight: '900' },
    riskScore: { fontSize: 22, fontWeight: '900' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 12, marginTop: 8 },
    mapCard: { marginBottom: 20, padding: 0 },
    mapArea: { height: 220, padding: 20 },
    mapBg: { flex: 1, position: 'relative', backgroundColor: 'rgba(0,217,245,0.02)', borderRadius: 16 },
    mapNode: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    originNode: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,245,160,0.15)', borderColor: '#00F5A0' },
    mapLabel: { position: 'absolute', color: theme.colors.textMuted, fontSize: 10, fontWeight: '700' },
    routeLine: { position: 'absolute', height: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
    alertCard: { marginBottom: 8, padding: 14 },
    alertRow: { flexDirection: 'row', alignItems: 'flex-start' },
    alertText: { color: theme.colors.textMuted, fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 20 },
    routeCard: { marginBottom: 12, padding: 16 },
    routeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    routeName: { flex: 1, color: theme.colors.text, fontWeight: '700', fontSize: 14, marginLeft: 10 },
    routeRisk: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    routeRiskText: { fontSize: 10, fontWeight: '900' },
    routeStats: { flexDirection: 'row', justifyContent: 'space-between' },
    routeStat: { alignItems: 'center', flex: 1 },
    routeStatVal: { color: theme.colors.text, fontWeight: '800', fontSize: 13 },
    routeStatLabel: { color: theme.colors.textMuted, fontSize: 10, marginTop: 4 },
});

export default SupplyChainScreen;
