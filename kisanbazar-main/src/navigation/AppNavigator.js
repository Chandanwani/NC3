import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import Dashboard from '../screens/Dashboard';
import DiseaseScanScreen from '../screens/DiseaseScanScreen';
import SoilHealthScreen from '../screens/SoilHealthScreen';
import MarketTrendsScreen from '../screens/MarketTrendsScreen';
import ClimateScreen from '../screens/ClimateScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SupplyChainScreen from '../screens/SupplyChainScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="DiseaseScan" component={DiseaseScanScreen} />
            <Stack.Screen name="SoilHealth" component={SoilHealthScreen} />
            <Stack.Screen name="MarketTrends" component={MarketTrendsScreen} />
            <Stack.Screen name="Climate" component={ClimateScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="SupplyChain" component={SupplyChainScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        </Stack.Navigator>
    );
};
