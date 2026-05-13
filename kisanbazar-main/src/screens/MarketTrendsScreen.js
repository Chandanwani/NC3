import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { TrendingUp, TrendingDown, ChevronLeft, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { subscribeMarketPrices } from '../services/dbService';
import { isConfigured } from '../services/firebase';

// Base commodity list
const COMMODITIES = [
    { name: 'Wheat', base: 2200, unit: '₹/quintal' },
    { name: 'Rice', base: 1900, unit: '₹/quintal' },
    { name: 'Tomato', base: 30, unit: '₹/kg' },
    { name: 'Onion', base: 25, unit: '₹/kg' },
    { name: 'Potato', base: 18, unit: '₹/kg' },
    { name: 'Cotton', base: 6500, unit: '₹/quintal' },
    { name: 'Soybean', base: 4200, unit: '₹/quintal' },
    { name: 'Mustard', base: 5100, unit: '₹/quintal' },
];

const generatePrices = () =>
    COMMODITIES.map(c => {
        const delta = +(-5 + Math.random() * 10).toFixed(1);
        return { ...c, price: Math.round(c.base * (1 + delta / 100)), delta };
    });

// Convert Firebase object → prices array
const firebaseToArray = (fbData) => {
    return COMMODITIES.map(c => {
        const key = c.name.toLowerCase();
        const fb = fbData[key];
        if (fb) {
            return { ...c, price: fb.price, delta: fb.delta };
        }
        const delta = +(-5 + Math.random() * 10).toFixed(1);
        return { ...c, price: Math.round(c.base * (1 + delta / 100)), delta };
    });
};

const MarketTrendsScreen = ({ navigation }) => {
    const [prices, setPrices] = useState(generatePrices());
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isLive, setIsLive] = useState(false);

    const refresh = () => {
        if (!isConfigured) {
            setPrices(generatePrices());
            setLastUpdate(new Date());
        }
    };

    useEffect(() => {
        // Subscribe to Firebase real-time price updates
        const unsub = subscribeMarketPrices((fbData) => {
            setPrices(firebaseToArray(fbData));
            setLastUpdate(new Date());
            setIsLive(true);
        });

        // Fallback: simulate prices every 15s if Firebase not active
        let interval;
        if (!isConfigured) {
            interval = setInterval(() => {
                setPrices(generatePrices());
                setLastUpdate(new Date());
            }, 15000);
        }

        return () => {
            unsub();
            if (interval) clearInterval(interval);
        };
    }, []);

    const gainers = [...prices].sort((a, b) => b.delta - a.delta).slice(0, 3);
    const losers = [...prices].sort((a, b) => a.delta - b.delta).slice(0, 3);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>Market AI</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isLive
                        ? <Wifi color={theme.colors.primary} size={16} style={{ marginRight: 8 }} />
                        : <WifiOff color={theme.colors.textMuted} size={16} style={{ marginRight: 8 }} />
                    }
                    <Pressable onPress={refresh} style={styles.refreshBtn}>
                        <RefreshCw color={theme.colors.primary} size={18} />
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: isLive ? `${theme.colors.primary}15` : 'rgba(255,255,255,0.04)' }]}>
                    <View style={[styles.statusDot, { backgroundColor: isLive ? theme.colors.primary : theme.colors.textMuted }]} />
                    <Text style={[styles.statusText, { color: isLive ? theme.colors.primary : theme.colors.textMuted }]}>
                        {isLive ? '● LIVE Firebase Prices' : '● Simulated Prices (Demo)'}
                    </Text>
                </View>

                {/* Top Gainers/Losers */}
                <View style={styles.summaryRow}>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>🔥 Top Gainer</Text>
                        <Text style={styles.summaryName}>{gainers[0]?.name}</Text>
                        <Text style={[styles.summaryDelta, { color: theme.colors.primary }]}>+{gainers[0]?.delta}%</Text>
                    </GlassCard>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>📉 Top Loser</Text>
                        <Text style={styles.summaryName}>{losers[0]?.name}</Text>
                        <Text style={[styles.summaryDelta, { color: theme.colors.error }]}>{losers[0]?.delta}%</Text>
                    </GlassCard>
                </View>

                <View style={styles.tickerRow}>
                    <Text style={styles.sectionTitle}>Live Prices</Text>
                    <Text style={styles.tickerTime}>{lastUpdate.toLocaleTimeString()}</Text>
                </View>

                {prices.map(item => {
                    const isUp = item.delta >= 0;
                    return (
                        <GlassCard key={item.name} style={styles.priceCard}>
                            <View style={styles.priceRow}>
                                <View>
                                    <Text style={styles.cropName}>{item.name}</Text>
                                    <Text style={styles.cropUnit}>{item.unit}</Text>
                                </View>
                                <View style={styles.priceRight}>
                                    <Text style={styles.price}>₹{item.price}</Text>
                                    <View style={styles.deltaRow}>
                                        {isUp
                                            ? <TrendingUp color={theme.colors.primary} size={16} />
                                            : <TrendingDown color={theme.colors.error} size={16} />
                                        }
                                        <Text style={[styles.delta, { color: isUp ? theme.colors.primary : theme.colors.error }]}>
                                            {isUp ? '+' : ''}{item.delta}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </GlassCard>
                    );
                })}
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
    statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
    statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '700' },
    content: { padding: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    summaryCard: { width: '47%', padding: 16, alignItems: 'center' },
    summaryLabel: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600' },
    summaryName: { fontSize: 18, fontWeight: '900', color: theme.colors.text, marginTop: 4 },
    summaryDelta: { fontSize: 16, fontWeight: '800', marginTop: 4 },
    tickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
    tickerTime: { fontSize: 11, color: theme.colors.textMuted },
    priceCard: { marginBottom: 10, padding: 16 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cropName: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
    cropUnit: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
    priceRight: { alignItems: 'flex-end' },
    price: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
    deltaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    delta: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
});

export default MarketTrendsScreen;
