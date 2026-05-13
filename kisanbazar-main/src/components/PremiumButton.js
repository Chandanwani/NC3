import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, gradients } from '../theme/theme';

const PremiumButton = ({ title, onPress, style }) => (
    <Pressable onPress={onPress} style={[styles.wrapper, style]}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
            <Text style={styles.text}>{title}</Text>
        </LinearGradient>
    </Pressable>
);

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 32,
        overflow: 'hidden',
    },
    gradient: {
        paddingHorizontal: 48,
        paddingVertical: 16,
        alignItems: 'center',
    },
    text: {
        color: theme.colors.background,
        fontSize: 18,
        fontWeight: '800',
    }
});

export default PremiumButton;
