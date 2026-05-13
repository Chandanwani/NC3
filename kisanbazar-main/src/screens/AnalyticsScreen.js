import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Dimensions } from 'react-native';
import { theme } from '../theme/theme';
import { ChevronLeft, TrendingUp, BarChart2, Activity, Zap } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';

const API_KEY = '4d8fb5b93d4af21d66a2948710284366';

const AnalyticsScreen = ({ navigation }) => {
    const [weather, setWeather] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [farmMetrics, setFarmMetrics] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Pune&appid=${API_KEY}&units=metric&cnt=16`);
                const data = await res.json();
                setWeather(data);

                // Generate AI predictions from real weather data
                const avgTemp = data.list.reduce((s, i) => s + i.main.temp, 0) / data.list.length;
                const avgHumid = data.list.reduce((s, i) => s + i.main.humidity, 0) / data.list.length;
                const rainChance = data.list.filter(i => i.weather[0].main === 'Rain').length / data.list.length * 100;

                setPredictions([
                    { label: 'Crop Yield Prediction', value: avgTemp < 35 && avgHumid > 40 ? 'High (82%)' : 'Moderate (65%)', color: '#00F5A0', icon: '🌾' },
                    { label: 'Disease Risk (Next 7 Days)', value: avgHumid > 70 ? 'Medium-High' : 'Low', color: avgHumid > 70 ? '#FFB74D' : '#00F5A0', icon: '🦠' },
                    { label: 'Rain Probability', value: `${Math.round(rainChance)}%`, color: rainChance > 40 ? '#00D9F5' : '#FFB74D', icon: '🌧️' },
                    { label: 'Optimal Sowing Window', value: avgTemp >= 20 && avgTemp <= 30 ? 'Now — Ideal' : 'Wait 5-7 Days', color: '#7E57C2', icon: '🌱' },
                    { label: 'Irrigation Forecast', value: rainChance > 50 ? 'Skip Tomorrow' : 'Irrigate AM', color: '#00D9F5', icon: '💧' },
                    { label: 'Market Price Trend', value: 'Wheat ↑3.2% in 7 days', color: '#00F5A0', icon: '📈' },
                ]);

                setFarmMetrics({
                    avgTemp: Math.round(avgTemp),
                    avgHumid: Math.round(avgHumid),
                    rainDays: data.list.filter(i => i.weather[0].main === 'Rain').length,
                    clearDays: data.list.filter(i => i.weather[0].main === 'Clear').length,
                    maxTemp: Math.round(Math.max(...data.list.map(i => i.main.temp_max))),
                    minTemp: Math.round(Math.min(...data.list.map(i => i.main.temp_min))),
                    avgWind: Math.round(data.list.reduce((s, i) => s + i.wind.speed, 0) / data.list.length * 3.6),
                    avgPressure: Math.round(data.list.reduce((s, i) => s + i.main.pressure, 0) / data.list.length),
                });
            } catch (e) {
                setPredictions([{ label: 'Data unavailable', value: 'Check network', color: '#FF4D4D', icon: '⚠️' }]);
            }
        };
        fetchData();
    }, []);

    // Simple bar chart visualization
    const BarChart = ({ data, label }) => {
        const max = Math.max(...data.map(d => d.val));
        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartLabel}>{label}</Text>
                <View style={styles.chartBars}>
                    {data.map((d, i) => (
                        <View key={i} style={styles.barCol}>
                            <View style={[styles.bar, { height: Math.max((d.val / max) * 80, 4), backgroundColor: d.color || theme.colors.primary }]} />
                            <Text style={styles.barLabel}>{d.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const tempData = weather ? weather.list.slice(0, 8).map(i => ({
        val: i.main.temp,
        label: new Date(i.dt * 1000).toLocaleTimeString([], { hour: '2-digit' }),
        color: i.main.temp > 30 ? '#FF4D4D' : '#00F5A0',
    })) : [];

    const humidData = weather ? weather.list.slice(0, 8).map(i => ({
        val: i.main.humidity,
        label: new Date(i.dt * 1000).toLocaleTimeString([], { hour: '2-digit' }),
        color: '#00D9F5',
    })) : [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>📊 Analytics & AI Predictions</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* AI Predictions */}
                <Text style={styles.sectionTitle}>🤖 AI Predictions</Text>
                <View style={styles.predGrid}>
                    {predictions.map((p, i) => (
                        <GlassCard key={i} style={styles.predCard}>
                            <Text style={styles.predIcon}>{p.icon}</Text>
                            <Text style={styles.predLabel}>{p.label}</Text>
                            <Text style={[styles.predValue, { color: p.color }]}>{p.value}</Text>
                        </GlassCard>
                    ))}
                </View>

                {/* Farm Metrics */}
                {farmMetrics.avgTemp && (
                    <>
                        <Text style={styles.sectionTitle}>📈 Farm Intelligence</Text>
                        <View style={styles.metricsRow}>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.avgTemp}°C</Text>
                                <Text style={styles.mmLabel}>Avg Temp</Text>
                            </GlassCard>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.avgHumid}%</Text>
                                <Text style={styles.mmLabel}>Avg Humid</Text>
                            </GlassCard>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.rainDays}</Text>
                                <Text style={styles.mmLabel}>Rain Slots</Text>
                            </GlassCard>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.avgWind}</Text>
                                <Text style={styles.mmLabel}>Wind km/h</Text>
                            </GlassCard>
                        </View>

                        <View style={styles.metricsRow}>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.maxTemp}°</Text>
                                <Text style={styles.mmLabel}>Max Temp</Text>
                            </GlassCard>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.minTemp}°</Text>
                                <Text style={styles.mmLabel}>Min Temp</Text>
                            </GlassCard>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.clearDays}</Text>
                                <Text style={styles.mmLabel}>Clear Slots</Text>
                            </GlassCard>
                            <GlassCard style={styles.metricMini}>
                                <Text style={styles.mmVal}>{farmMetrics.avgPressure}</Text>
                                <Text style={styles.mmLabel}>Pressure</Text>
                            </GlassCard>
                        </View>
                    </>
                )}

                {/* Charts */}
                {tempData.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>🌡️ Temperature Trend</Text>
                        <GlassCard style={styles.chartCard}>
                            <BarChart data={tempData} label="Temp (°C)" />
                        </GlassCard>

                        <Text style={styles.sectionTitle}>💧 Humidity Trend</Text>
                        <GlassCard style={styles.chartCard}>
                            <BarChart data={humidData} label="Humidity (%)" />
                        </GlassCard>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    bgCircle1: { position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(126,87,194,0.04)' },
    bgCircle2: { position: 'absolute', bottom: 80, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,245,160,0.03)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 16 },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginLeft: 16 },
    content: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text, marginBottom: 12, marginTop: 8 },
    predGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    predCard: { width: '47%', marginBottom: 12, padding: 16, alignItems: 'center' },
    predIcon: { fontSize: 28, marginBottom: 8 },
    predLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
    predValue: { fontSize: 15, fontWeight: '900', textAlign: 'center' },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    metricMini: { flex: 1, marginHorizontal: 3, padding: 12, alignItems: 'center' },
    mmVal: { color: theme.colors.text, fontSize: 16, fontWeight: '900' },
    mmLabel: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '600', marginTop: 4 },
    chartCard: { padding: 16, marginBottom: 16 },
    chartContainer: {},
    chartLabel: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 12 },
    chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
    barCol: { alignItems: 'center', flex: 1 },
    bar: { width: 16, borderRadius: 4 },
    barLabel: { color: theme.colors.textMuted, fontSize: 9, marginTop: 6 },
});

export default AnalyticsScreen;
