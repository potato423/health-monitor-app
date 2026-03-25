import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import RecordScreen from './src/screens/RecordScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { paymentService } from './src/services/paymentService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#333333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen name="首页" component={HomeScreen} />
      <Tab.Screen name="记录" component={RecordScreen} />
      <Tab.Screen name="分析" component={AnalysisScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isTrial, setIsTrial] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      const { isTrial: trialStatus } = await paymentService.checkTrialStatus();
      setIsTrial(trialStatus);
    } catch (error) {
      console.error('Failed to check trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // 或显示加载界面
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        {!isTrial ? (
          <Stack.Screen 
            name="Paywall" 
            component={PaywallScreen}
            options={{ headerShown: false }}
          />
        ) : null}
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}