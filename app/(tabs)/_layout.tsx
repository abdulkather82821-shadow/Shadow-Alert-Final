import { Tabs } from 'expo-router';
import { Home, AppWindow, BarChart3, Settings } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.neutral.surface,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          height: Platform.OS === 'web' ? 64 : 80,
          paddingBottom: Platform.OS === 'web' ? 8 : 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
          tabBarIcon: ({ size, color }) => <AppWindow size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
