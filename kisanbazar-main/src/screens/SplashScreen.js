import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { theme } from '../theme/theme';

const SplashScreen = ({ navigation }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();

        const timer = setTimeout(() => navigation.replace('Onboarding'), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity, transform: [{ scale }] }]}>
                <Text style={styles.logoText}>AN</Text>
            </Animated.View>
            <Animated.View style={{ opacity }}>
                <Text style={styles.appName}>My_Agri AI</Text>
                <Text style={styles.tagline}>Intelligence. Grown Naturally.</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    logoText: {
        fontSize: 40,
        fontWeight: '900',
        color: theme.colors.background,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        letterSpacing: 2,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 14,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 8,
        letterSpacing: 1,
    }
});

export default SplashScreen;
