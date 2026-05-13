import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

const GlassCard = ({ style, children, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const glow = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 1, duration: 150, useNativeDriver: false }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start();
    };

    const borderColor = glow.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.08)', 'rgba(0,245,160,0.4)'],
    });

    const shadowOpacity = glow.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.3],
    });

    const Component = onPress ? Pressable : Animated.View;

    return (
        <Animated.View style={[
            styles.card,
            { transform: [{ scale }], borderColor, shadowOpacity },
            style,
        ]}>
            {onPress ? (
                <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ flex: 1 }}>
                    {children}
                </Pressable>
            ) : (
                <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
                    {children}
                </Pressable>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 16,
        shadowColor: '#00F5A0',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
    },
});

export default GlassCard;
