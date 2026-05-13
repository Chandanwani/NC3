import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Animated } from 'react-native';
import { theme } from '../theme/theme';
import { Leaf, Droplets, TrendingUp, CloudSun, Truck, Bell, Settings, Mic, Users, Zap, BarChart2, Clock } from 'lucide-react-native';
import VoiceAssistantModal from '../components/VoiceAssistantModal';
import GlassCard from '../components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

const MODULES = [
    { id: 'disease', title: 'Disease Scan', icon: Leaf, color: '#00F5A0', status: 'AI Ready', screen: 'DiseaseScan' },
    { id: 'analytics', title: 'Analytics', icon: BarChart2, color: '#26C6DA', status: 'AI predictions', screen: 'Analytics' },
    { id: 'market', title: 'Market AI', icon: TrendingUp, color: '#7E57C2', status: 'Live prices', screen: 'MarketTrends' },
    { id: 'weather', title: 'Climate', icon: CloudSun, color: '#FFB74D', status: 'Live weather', screen: 'Climate' },
    { id: 'supply', title: 'Logistics', icon: Truck, color: '#FF4D4D', status: 'Risk monitored', screen: 'SupplyChain' },
    { id: 'community', title: 'Community', icon: Users, color: '#AB47BC', status: 'Active feed', screen: 'Community' },
    { id: 'soil', title: 'Soil Core', icon: Droplets, color: '#00D9F5', status: 'Live sensors', screen: 'SoilHealth' },
];

const NOTIFICATIONS = [
    '🌱 Soil moisture dropped to 38%. Consider irrigating today.',
    '📈 Wheat prices up 3.2% — good time to sell.',
    '🌧️ Rain expected in Pune tomorrow. Secure crops.',
    '🔬 Weekly disease scan reminder — scan your crops!',
    '🚛 Route B-42 congestion cleared. Dispatches resumed.',
    '💬 Rajesh Kumar liked your post in Community.',
    '🤖 AI agent detected early blight risk in your area.',
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 6) return 'Good Night 🌙';
    if (h < 12) return 'Good Morning ☀️';
    if (h < 17) return 'Good Afternoon 🌤️';
    if (h < 21) return 'Good Evening 🌅';
    return 'Good Night 🌙';
}

const Dashboard = ({ navigation }) => {
    const [voiceVisible, setVoiceVisible] = useState(false);
    const [notifIndex, setNotifIndex] = useState(0);
    const [clock, setClock] = useState('');
    const notifAnim = useRef(new Animated.Value(-60)).current;
    const orbPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const updateClock = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        updateClock();
        const t = setInterval(updateClock, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const show = () => {
            Animated.timing(notifAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
            setTimeout(() => {
                Animated.timing(notifAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
                    setNotifIndex(i => (i + 1) % NOTIFICATIONS.length);
                });
            }, 4000);
        };
        show();
        const interval = setInterval(show, 8000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(orbPulse, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
                Animated.timing(orbPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <VoiceAssistantModal visible={voiceVisible} onClose={() => setVoiceVisible(false)} />
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
            <View style={styles.bgCircle3} />

            {/* Live Notification */}
            <Animated.View style={[styles.notifBar, { transform: [{ translateY: notifAnim }] }]}>
                <Zap color="#00F5A0" size={14} />
                <Text style={styles.notifText} numberOfLines={1}>{NOTIFICATIONS[notifIndex]}</Text>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.name}>Niraja's Team</Text>
                        <Text style={styles.location}>📍 Akurdi, Pune 411044</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.clockBox}>
                            <Clock color={theme.colors.primary} size={12} />
                            <Text style={styles.clockText}>{clock}</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <Pressable style={styles.iconBtn}><Bell color={theme.colors.text} size={20} /><View style={styles.notifDot} /></Pressable>
                            <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}><Settings color={theme.colors.text} size={20} /></Pressable>
                        </View>
                    </View>
                </View>

                {/* AI Orb */}
                <Pressable style={styles.orb} onPress={() => setVoiceVisible(true)}>
                    <Animated.View style={{ transform: [{ scale: orbPulse }] }}>
                        <LinearGradient colors={['#00F5A0', '#00D9F5']} style={styles.orbInner}>
                            <Mic color="#050B18" size={36} />
                        </LinearGradient>
                    </Animated.View>
                    <Text style={styles.orbLabel}>Speak to My_Agri AI</Text>
                    <View style={styles.agentBadge}><View style={styles.agentDot} /><Text style={styles.orbHint}>AI Agent Active</Text></View>
                </Pressable>

                {/* Modules */}
                <Text style={styles.sectionTitle}>🧠 Intelligence Modules</Text>
                <View style={styles.grid}>
                    {MODULES.map(mod => {
                        const Icon = mod.icon;
                        return (
                            <GlassCard key={mod.id} onPress={() => navigation.navigate(mod.screen)} style={styles.moduleCard}>
                                <View style={[styles.moduleIconBox, { backgroundColor: `${mod.color}20`, borderColor: `${mod.color}30`, borderWidth: 1 }]}>
                                    <Icon color={mod.color} size={26} />
                                </View>
                                <Text style={styles.moduleTitle}>{mod.title}</Text>
                                <View style={styles.moduleStatus}>
                                    <View style={[styles.statusDot, { backgroundColor: mod.color }]} />
                                    <Text style={styles.statusText}>{mod.status}</Text>
                                </View>
                            </GlassCard>
                        );
                    })}
                </View>

                {/* AI Agent */}
                <LinearGradient colors={['rgba(0,245,160,0.12)', 'rgba(0,217,245,0.04)']} style={styles.agentCard}>
                    <View style={styles.agentHeader}>
                        <Text style={styles.agentTitle}>🤖 My_Agri AI Agent</Text>
                        <View style={styles.liveBadge}><Text style={styles.liveText}>● LIVE</Text></View>
                    </View>
                    <Text style={styles.agentText}>Monitoring your farm 24/7 from Akurdi, Pune.</Text>
                    <View style={styles.agentStats}>
                        <View style={styles.agentStat}><Text style={styles.agentStatVal}>3</Text><Text style={styles.agentStatLabel}>Alerts</Text></View>
                        <View style={styles.agentStat}><Text style={styles.agentStatVal}>✅</Text><Text style={styles.agentStatLabel}>Soil OK</Text></View>
                        <View style={styles.agentStat}><Text style={styles.agentStatVal}>📈</Text><Text style={styles.agentStatLabel}>Market ↑</Text></View>
                        <View style={styles.agentStat}><Text style={styles.agentStatVal}>☀️</Text><Text style={styles.agentStatLabel}>Weather</Text></View>
                    </View>
                </LinearGradient>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    bgCircle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0,245,160,0.04)' },
    bgCircle2: { position: 'absolute', bottom: 80, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(0,217,245,0.03)' },
    bgCircle3: { position: 'absolute', top: '40%', right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(126,87,194,0.03)' },
    notifBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    notifText: { color: '#00F5A0', fontWeight: '700', fontSize: 12, marginLeft: 8, flex: 1 },
    scroll: { padding: 20, paddingTop: 44, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    greeting: { fontSize: 16, color: theme.colors.primary, fontWeight: '700' },
    name: { fontSize: 24, fontWeight: '900', color: theme.colors.text, marginTop: 2 },
    location: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
    headerRight: { alignItems: 'flex-end' },
    clockBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,245,160,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginBottom: 8 },
    clockText: { color: theme.colors.primary, fontSize: 12, fontWeight: '800', marginLeft: 6, fontVariant: ['tabular-nums'] },
    headerActions: { flexDirection: 'row' },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginLeft: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D' },
    orb: { alignItems: 'center', marginBottom: 32 },
    orbInner: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    orbLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
    agentBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    agentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00F5A0', marginRight: 6 },
    orbHint: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    moduleCard: { width: '47%', marginBottom: 14, padding: 16 },
    moduleIconBox: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    moduleTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginBottom: 6 },
    moduleStatus: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '600' },
    agentCard: { borderRadius: 20, padding: 20, marginTop: 8, borderWidth: 1, borderColor: 'rgba(0,245,160,0.15)' },
    agentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    agentTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800' },
    liveBadge: { backgroundColor: 'rgba(0,245,160,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    liveText: { color: '#00F5A0', fontSize: 10, fontWeight: '900' },
    agentText: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 16 },
    agentStats: { flexDirection: 'row', justifyContent: 'space-around' },
    agentStat: { alignItems: 'center' },
    agentStatVal: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
    agentStatLabel: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4 },
});

export default Dashboard;
