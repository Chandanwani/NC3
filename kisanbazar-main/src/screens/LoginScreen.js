import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { Shield } from 'lucide-react-native';
import { signIn, signUp } from '../services/auth';
import { isConfigured } from '../services/firebase';
import { saveUserProfile } from '../services/dbService';
import Button3D from '../components/Button3D';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [clock, setClock] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const t = setInterval(() => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
        return () => clearInterval(t);
    }, []);

    const handleAuth = async () => {
        // Demo / guest mode — Firebase not configured
        if (!isConfigured) {
            navigation.replace('Dashboard');
            return;
        }
        if (!email.trim() || !password.trim()) {
            Alert.alert('Missing fields', 'Please enter your email and password.');
            return;
        }
        if (isSignUp && !name.trim()) {
            Alert.alert('Missing name', 'Please enter your name to create an account.');
            return;
        }
        setLoading(true);
        try {
            let user;
            if (isSignUp) {
                user = await signUp(email.trim(), password, name.trim());
                // Persist profile to Realtime DB
                await saveUserProfile(user.uid, {
                    displayName: name.trim(),
                    email: email.trim(),
                    region: 'Pune, MH',
                    createdAt: Date.now(),
                });
            } else {
                user = await signIn(email.trim(), password);
            }
            navigation.replace('Dashboard');
        } catch (err) {
            Alert.alert('Authentication Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        if (!isConfigured) { navigation.replace('Dashboard'); return; }
        Alert.alert('Google Sign-In', 'Google Sign-In requires native build. Use email/password or tap "Continue as Guest".');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <View style={styles.content}>
                <Text style={styles.clock}>{clock}</Text>

                {/* Logo */}
                <View style={styles.iconWrap}>
                    <Shield color={theme.colors.primary} size={48} />
                </View>
                <Text style={styles.title}>My_Agri AI</Text>
                <Text style={styles.subtitle}>{isSignUp ? 'Create Account' : 'Secure Access'}</Text>

                {/* Name field (sign-up only) */}
                {isSignUp && (
                    <TextInput
                        style={styles.input}
                        placeholder="Your Name"
                        placeholderTextColor={theme.colors.textMuted}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={theme.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button3D
                    title={loading ? 'Loading…' : (isSignUp ? 'Create Account' : 'Authenticate')}
                    onPress={handleAuth}
                    disabled={loading}
                    style={{ width: '100%', marginTop: 8, marginBottom: 12 }}
                />

                {/* Google Sign-In */}
                <Pressable style={styles.googleBtn} onPress={handleGoogle}>
                    <View style={styles.googleIcon}><Text style={{ fontSize: 18, fontWeight: '900' }}>G</Text></View>
                    <Text style={styles.googleText}>Continue with Google</Text>
                </Pressable>

                {/* Guest */}
                <Pressable style={styles.guestBtn} onPress={() => navigation.replace('Dashboard')}>
                    <Text style={styles.guestText}>Continue as Guest →</Text>
                </Pressable>

                <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.switchBtn}>
                    <Text style={styles.switchText}>
                        {isSignUp ? 'Already have an account? ' : 'New farmer? '}
                        <Text style={{ color: theme.colors.primary }}>{isSignUp ? 'Sign In' : 'Register'}</Text>
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    bgCircle1: { position: 'absolute', top: -80, right: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,245,160,0.04)' },
    bgCircle2: { position: 'absolute', bottom: 60, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(0,217,245,0.03)' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    clock: { position: 'absolute', top: 20, right: 24, color: theme.colors.textMuted, fontSize: 14, fontWeight: '600' },
    iconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${theme.colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1.5, borderColor: `${theme.colors.primary}40` },
    title: { fontSize: 34, fontWeight: '900', color: theme.colors.text, marginBottom: 6 },
    subtitle: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 28 },
    input: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, color: theme.colors.text, fontSize: 16, marginBottom: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
    googleBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
    googleIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    googleText: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
    guestBtn: { paddingVertical: 12 },
    guestText: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
    switchBtn: { marginTop: 12 },
    switchText: { color: theme.colors.textMuted, fontSize: 14 },
});

export default LoginScreen;
