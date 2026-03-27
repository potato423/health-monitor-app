import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, ActivityIndicator } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import RecordScreen from './src/screens/RecordScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import FoodResultScreen from './src/screens/FoodResultScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { Colors } from './src/constants/colors';
import { storageService } from './src/services/storage';
import { FoodAnalysisResult } from './src/services/foodRecognition';

export type RootStackParamList = {
  Main: undefined;
  FoodResult: { analysisResult?: FoodAnalysisResult };
  Profile: undefined;
  Paywall: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
  Analysis: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const OnboardingStack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const map: Record<string, [string, string]> = {
            Home: ['home', 'home-outline'],
            Record: ['calendar', 'calendar-outline'],
            Analysis: ['bar-chart', 'bar-chart-outline'],
          };
          const [active, inactive] = map[route.name] ?? ['circle', 'circle-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopColor: Colors.separator,
          borderTopWidth: 0.5,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
      <Tab.Screen name="Record" component={RecordScreen} options={{ tabBarLabel: '记录' }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ tabBarLabel: '分析' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal', gestureEnabled: true }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ presentation: 'card' }} />
      <Stack.Screen name="FoodResult" component={FoodResultScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    storageService.isOnboardingDone().then((done) => {
      setShowOnboarding(!done);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' }}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {showOnboarding
        ? <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
            <OnboardingStack.Screen name="Onboarding">
              {() => <OnboardingScreen onDone={() => setShowOnboarding(false)} />}
            </OnboardingStack.Screen>
          </OnboardingStack.Navigator>
        : <AppNavigator />
      }
    </NavigationContainer>
  );
}
