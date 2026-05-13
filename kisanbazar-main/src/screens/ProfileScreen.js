import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { theme, useTheme } from '../theme/theme';
import { ChevronLeft, Globe, Bell, Sun, Moon, ShieldCheck, LogOut, ChevronRight, User } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { logout, getCurrentUser, onAuthChange } from '../services/auth';
import { getUserScanCount, getUserPostCount, getUserProfile } from '../services/dbService';
import { isConfigured } from '../services/firebase';

const ProfileScreen = ({ navigation }) => {
    let isDark = true, toggleTheme = () => { }, colors = theme.colors;
    try { const t = useTheme(); isDark = t.isDark; toggleTheme = t.toggle; colors = t.colors; } catch (e) { }

    const [user, setUser] = useState(getCurrentUser());
    const [scanCount, setScanCount] = useState(47);
    const [postCount, setPostCount] = useState(12);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthChange((u) => {
            setUser(u);
            if (u) loadStats(u);
        });
        // Load stats for current user
        const current = getCurrentUser();
        if (current) loadStats(current);

        return () => unsubscribe();
    }, []);

    const loadStats = async (u) => {
        const scans = await getUserScanCount(u.uid);
        const posts = await getUserPostCount(u.displayName || "Niraja's Team");
        if (scans > 0) setScanCount(scans);
        if (posts > 0) setPostCount(posts);
    };

    const displayName = user?.displayName || "Niraja's Team";
    const email = user?.email || (isConfigured ? '' : 'demo@myagriai.com');
    const initials = displayName.charAt(0).toUpperCase();

    const SETTINGS = [
        { icon: Globe, label: 'Language', value: 'English', color: colors.secondary },
        { icon: Bell, label: 'Notifications', value: 'On', color: '#FFB74D' },
        { icon: ShieldCheck, label: 'Data Privacy', value: 'Protected', color: colors.primary },
    ];

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        await logout();
                        setLoading(false);
                        navigation.replace('Login');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={colors.text} size={28} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <GlassCard style={styles.userCard}>
                    <View style={[styles.avatar, { backgroundColor: `${colors.primary}30` }]}>
                        <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
                    </View>
                    <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
                    {email ? (
                        <Text style={[styles.userEmail, { color: colors.primary }]}>{email}</Text>
                    ) : null}
                    <Text style={[styles.userId, { color: colors.textMuted }]}>My_Agri AI Pro Member</Text>
                    <Text style={[styles.location, { color: colors.textMuted }]}>📍 Pune, MH (Akurdi 411044)</Text>

                    {/* Firebase status */}
                    <View style={[styles.fbBadge, { backgroundColor: isConfigured ? `${colors.primary}15` : 'rgba(255,255,255,0.05)' }]}>
                        <View style={[styles.fbDot, { backgroundColor: isConfigured ? colors.primary : colors.textMuted }]} />
                        <Text style={[styles.fbText, { color: isConfigured ? colors.primary : colors.textMuted }]}>
                            {isConfigured ? '● Firebase Connected' : '● Demo Mode (Configure Firebase)'}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{scanCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Scans</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{postCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>89%</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Accuracy</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Theme Toggle */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
                <GlassCard style={styles.themeCard}>
                    <View style={styles.themeRow}>
                        {isDark ? <Moon color={colors.primary} size={20} /> : <Sun color="#FFB74D" size={20} />}
                        <Text style={[styles.themeLabel, { color: colors.text }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#ddd', true: `${colors.primary}50` }}
                            thumbColor={isDark ? colors.primary : '#FFB74D'}
                        />
                    </View>
                </GlassCard>

                {/* Settings */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
                {SETTINGS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <GlassCard key={i} style={styles.settingCard}>
                            <View style={styles.settingRow}>
                                <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                                    <Icon color={item.color} size={18} />
                                </View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                                <Text style={[styles.settingValue, { color: colors.textMuted }]}>{item.value}</Text>
                                <ChevronRight color={colors.textMuted} size={16} />
                            </View>
                        </GlassCard>
                    );
                })}

                <Pressable style={styles.logoutBtn} onPress={handleSignOut} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#FF4D4D" size="small" />
                        : <LogOut color="#FF4D4D" size={18} />
                    }
                    <Text style={styles.logoutText}>Sign Out</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 16 },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: 20, fontWeight: '800', marginLeft: 16 },
    content: { padding: 20, paddingBottom: 40 },
    userCard: { alignItems: 'center', padding: 32, marginBottom: 24 },
    avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    avatarText: { fontSize: 32, fontWeight: '900' },
    userName: { fontSize: 22, fontWeight: '900' },
    userEmail: { fontSize: 13, marginTop: 4, fontWeight: '600' },
    userId: { fontSize: 14, marginTop: 4 },
    location: { fontSize: 12, marginTop: 8 },
    fbBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginTop: 12, marginBottom: 8 },
    fbDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    fbText: { fontSize: 11, fontWeight: '700' },
    statsRow: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
    statItem: { alignItems: 'center', paddingHorizontal: 20 },
    statValue: { fontSize: 22, fontWeight: '900' },
    statLabel: { fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, height: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
    themeCard: { marginBottom: 20, padding: 16 },
    themeRow: { flexDirection: 'row', alignItems: 'center' },
    themeLabel: { flex: 1, fontWeight: '700', fontSize: 15, marginLeft: 12 },
    settingCard: { marginBottom: 10, padding: 16 },
    settingRow: { flexDirection: 'row', alignItems: 'center' },
    settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    settingLabel: { flex: 1, fontWeight: '700', fontSize: 15 },
    settingValue: { fontSize: 13, marginRight: 8 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 14, backgroundColor: 'rgba(255,77,77,0.08)', marginTop: 24, borderWidth: 1, borderColor: 'rgba(255,77,77,0.2)' },
    logoutText: { color: '#FF4D4D', fontWeight: '800', fontSize: 16, marginLeft: 8 },
});

export default ProfileScreen;
