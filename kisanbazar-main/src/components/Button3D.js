import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Button3D = ({ title, onPress, icon, colors = ['#00F5A0', '#00C77B'], style, textStyle, disabled }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 3, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale }, { translateY }] }, style]}>
            {/* 3D shadow layer */}
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={[styles.shadowLayer, disabled && { opacity: 0.5 }]}
            >
                <LinearGradient colors={colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    {icon}
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    shadowLayer: {
        borderRadius: 16,
        shadowColor: '#00F5A0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    gradient: {
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(0,0,0,0.15)',
    },
    text: {
        color: '#050B18',
        fontSize: 17,
        fontWeight: '900',
        marginLeft: 8,
        letterSpacing: 0.3,
    },
});

export default Button3D;
