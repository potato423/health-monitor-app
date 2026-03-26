import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import RecordScreen from './src/screens/RecordScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === '首页 Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === '记录 Records') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else {
              iconName = focused ? 'analytics' : 'analytics-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5EA',
            paddingTop: 8,
            height: 88,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="首页 Home" 
          component={HomeScreen}
        />
        <Tab.Screen 
          name="记录 Records" 
          component={RecordScreen}
        />
        <Tab.Screen 
          name="分析 Analysis" 
          component={AnalysisScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}