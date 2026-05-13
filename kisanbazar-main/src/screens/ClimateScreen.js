import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { ChevronLeft, Wind, Droplets, Eye, Thermometer, Compass } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';

const API_KEY = '4d8fb5b93d4af21d66a2948710284366';
const CITY = 'Pune';

const ClimateScreen = ({ navigation }) => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aqi, setAqi] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Current weather
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`);
                const data = await res.json();
                setWeather({
                    temp: Math.round(data.main.temp),
                    feelsLike: Math.round(data.main.feels_like),
                    tempMin: Math.round(data.main.temp_min),
                    tempMax: Math.round(data.main.temp_max),
                    condition: data.weather[0].main,
                    desc: data.weather[0].description,
                    icon: getIcon(data.weather[0].main),
                    location: `${data.name}, ${data.sys.country}`,
                    humidity: data.main.humidity,
                    wind: Math.round(data.wind.speed * 3.6),
                    windDir: degToDir(data.wind.deg),
                    pressure: data.main.pressure,
                    visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : '--',
                    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    clouds: data.clouds?.all,
                });

                // Air quality
                try {
                    const aqRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`);
                    const aqData = await aqRes.json();
                    const aqiVal = aqData.list?.[0]?.main?.aqi;
                    setAqi(aqiVal);
                } catch (e) { }

                // Forecast
                const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&cnt=8`);
                const fData = await fRes.json();
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                setForecast(fData.list.map(item => ({
                    day: days[new Date(item.dt * 1000).getDay()],
                    time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    temp: Math.round(item.main.temp),
                    icon: getIcon(item.weather[0].main),
                    humidity: item.main.humidity,
                })));
            } catch (e) {
                setWeather({ temp: 28, condition: 'Clear', icon: '☀️', location: CITY, humidity: 60, wind: 12, feelsLike: 30, visibility: 8, sunrise: '06:30 AM', sunset: '06:15 PM' });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
        const interval = setInterval(fetchAll, 300000); // Refresh every 5 min
        return () => clearInterval(interval);
    }, []);

    const getAdvisory = () => {
        if (!weather) return '';
        if (weather.condition === 'Rain') return '🌧️ Active rain in Pune. Postpone spraying. Clear drainage channels. Protect harvested produce.';
        if (weather.humidity > 80) return '💧 High humidity alert. Watch for fungal diseases on crops. Apply preventive fungicide.';
        if (weather.temp > 38) return '🔥 Heat stress risk. Increase irrigation. Apply mulch. Avoid working during peak hours.';
        if (weather.wind > 30) return '💨 High winds. Secure crop covers and delay drone operations.';
        return '✅ Good farming conditions. Ideal for sowing, spraying, or harvesting.';
    };

    const aqiLabel = (v) => ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][v] || '--';
    const aqiColor = (v) => ['', '#00F5A0', '#A0D911', '#FFB74D', '#FF4D4D', '#8B0000'][v] || '#999';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>🌤️ Climate Intelligence</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 60 }} />
                ) : (
                    <>
                        {/* Hero */}
                        <GlassCard style={styles.heroCard}>
                            <Text style={styles.weatherIcon}>{weather?.icon}</Text>
                            <Text style={styles.temp}>{weather?.temp}°</Text>
                            <Text style={styles.condition}>{weather?.desc || weather?.condition}</Text>
                            <Text style={styles.location}>📍 {weather?.location}</Text>
                            <Text style={styles.feelsLike}>Feels like {weather?.feelsLike}° • High {weather?.tempMax}° / Low {weather?.tempMin}°</Text>
                        </GlassCard>

                        {/* Detailed Stats Grid */}
                        <View style={styles.statsGrid}>
                            <GlassCard style={styles.statCard}>
                                <Wind color="#00D9F5" size={18} />
                                <Text style={styles.statVal}>{weather?.wind} km/h</Text>
                                <Text style={styles.statLabel}>{weather?.windDir || ''} Wind</Text>
                            </GlassCard>
                            <GlassCard style={styles.statCard}>
                                <Droplets color="#00F5A0" size={18} />
                                <Text style={styles.statVal}>{weather?.humidity}%</Text>
                                <Text style={styles.statLabel}>Humidity</Text>
                            </GlassCard>
                            <GlassCard style={styles.statCard}>
                                <Eye color="#7E57C2" size={18} />
                                <Text style={styles.statVal}>{weather?.visibility} km</Text>
                                <Text style={styles.statLabel}>Visibility</Text>
                            </GlassCard>
                            <GlassCard style={styles.statCard}>
                                <Thermometer color="#FFB74D" size={18} />
                                <Text style={styles.statVal}>{weather?.pressure} hPa</Text>
                                <Text style={styles.statLabel}>Pressure</Text>
                            </GlassCard>
                        </View>

                        {/* Sun & AQI */}
                        <View style={styles.rowCards}>
                            <GlassCard style={styles.sunCard}>
                                <Text style={styles.sunEmoji}>🌅</Text>
                                <Text style={styles.sunVal}>{weather?.sunrise}</Text>
                                <Text style={styles.sunLabel}>Sunrise</Text>
                            </GlassCard>
                            <GlassCard style={styles.sunCard}>
                                <Text style={styles.sunEmoji}>🌇</Text>
                                <Text style={styles.sunVal}>{weather?.sunset}</Text>
                                <Text style={styles.sunLabel}>Sunset</Text>
                            </GlassCard>
                            {aqi && (
                                <GlassCard style={styles.sunCard}>
                                    <Text style={styles.sunEmoji}>🌬️</Text>
                                    <Text style={[styles.sunVal, { color: aqiColor(aqi) }]}>{aqiLabel(aqi)}</Text>
                                    <Text style={styles.sunLabel}>Air Quality</Text>
                                </GlassCard>
                            )}
                        </View>

                        {/* Advisory */}
                        <GlassCard style={styles.advisory}>
                            <Text style={styles.advisoryTitle}>🤖 AI Farm Advisory</Text>
                            <Text style={styles.advisoryText}>{getAdvisory()}</Text>
                        </GlassCard>

                        {/* Forecast */}
                        {forecast.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>📊 Hourly Forecast</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {forecast.map((f, i) => (
                                        <GlassCard key={i} style={styles.dayCard}>
                                            <Text style={styles.dayTime}>{f.time}</Text>
                                            <Text style={styles.dayIcon}>{f.icon}</Text>
                                            <Text style={styles.dayTemp}>{f.temp}°</Text>
                                            <Text style={styles.dayHumid}>💧{f.humidity}%</Text>
                                        </GlassCard>
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

function getIcon(c) {
    return { Clear: '☀️', Clouds: '⛅', Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Haze: '🌫️', Smoke: '🌫️' }[c] || '🌤️';
}

function degToDir(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    bgCircle1: { position: 'absolute', top: -80, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(0,217,245,0.03)' },
    bgCircle2: { position: 'absolute', bottom: 60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,183,77,0.03)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 16 },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginLeft: 16 },
    content: { padding: 20, paddingBottom: 40 },
    heroCard: { alignItems: 'center', padding: 32, marginBottom: 20 },
    weatherIcon: { fontSize: 64, marginBottom: 4 },
    temp: { fontSize: 72, fontWeight: '900', color: theme.colors.text },
    condition: { fontSize: 18, color: theme.colors.textMuted, textTransform: 'capitalize', marginTop: 4 },
    location: { fontSize: 13, color: theme.colors.textMuted, marginTop: 6 },
    feelsLike: { fontSize: 12, color: theme.colors.textMuted, marginTop: 8 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    statCard: { width: '47%', marginBottom: 12, padding: 14, alignItems: 'center' },
    statVal: { fontSize: 18, fontWeight: '900', color: theme.colors.text, marginTop: 8 },
    statLabel: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4, fontWeight: '600' },
    rowCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    sunCard: { flex: 1, marginHorizontal: 4, padding: 12, alignItems: 'center' },
    sunEmoji: { fontSize: 24 },
    sunVal: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginTop: 4 },
    sunLabel: { fontSize: 10, color: theme.colors.textMuted, marginTop: 4 },
    advisory: { padding: 20, marginBottom: 20 },
    advisoryTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800', marginBottom: 8 },
    advisoryText: { color: theme.colors.textMuted, lineHeight: 22 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 12 },
    dayCard: { width: 82, alignItems: 'center', marginRight: 10, padding: 12 },
    dayTime: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '600' },
    dayIcon: { fontSize: 28, marginVertical: 6 },
    dayTemp: { color: theme.colors.text, fontWeight: '800', fontSize: 16 },
    dayHumid: { color: theme.colors.textMuted, fontSize: 10, marginTop: 4 },
});

export default ClimateScreen;
