import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { theme } from '../theme/theme';
import { Leaf, Cpu, Globe } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        icon: Leaf,
        color: theme.colors.primary,
        title: 'Precision AI',
        subtitle: 'Scan crops with\nhigh-fidelity AI vision',
    },
    {
        icon: Cpu,
        color: theme.colors.secondary,
        title: 'Soil Intelligence',
        subtitle: 'Real-time soil health\nmonitoring & insights',
    },
    {
        icon: Globe,
        color: theme.colors.accent,
        title: 'Global Markets',
        subtitle: 'AI-powered price\npredictions & logistics',
    },
];

const OnboardingScreen = ({ navigation }) => {
    const [index, setIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const goNext = () => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            if (index < SLIDES.length - 1) {
                setIndex(index + 1);
            } else {
                navigation.replace('Login');
                return;
            }
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        });
    };

    const slide = SLIDES[index];
    const IconComp = slide.icon;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={[styles.iconCircle, { backgroundColor: `${slide.color}20`, borderColor: slide.color }]}>
                    <IconComp color={slide.color} size={64} />
                </View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </Animated.View>

            <View style={styles.dots}>
                {SLIDES.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
            </View>

            <Pressable style={styles.btn} onPress={goNext}>
                <Text style={styles.btnText}>{index === SLIDES.length - 1 ? 'Connect Now' : 'Next'}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    content: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        borderWidth: 1,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: theme.colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 28,
    },
    dots: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: theme.colors.primary,
        width: 24,
    },
    btn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 32,
        marginBottom: 40,
    },
    btnText: {
        color: theme.colors.background,
        fontSize: 18,
        fontWeight: '800',
    },
});

export default OnboardingScreen;
