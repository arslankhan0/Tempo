import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';

export default function TabLayout() {
  const { isDark } = useAppTheme();
  const background = isDark ? '#0B1929' : '#F4F6F8';
  const tabBackground = isDark ? '#07101B' : '#FFFFFF';
  const border = isDark ? '#192A3D' : '#DFE5EA';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }} edges={['top', 'left', 'right']}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: background },
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FF6B1A',
          tabBarInactiveTintColor: isDark ? '#60758C' : '#738294',
          tabBarStyle: {
            height: 72,
            paddingTop: 8,
            backgroundColor: tabBackground,
            borderTopColor: border,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ focused }) => <View className={`h-14 w-14 items-center justify-center rounded-full ${focused ? 'bg-[#FF6B1A]' : 'bg-[#E8EDF1] dark:bg-[#132338]'}`}><Feather name="clock" color={focused ? 'white' : isDark ? '#8B9CAF' : '#526276'} size={23} /></View> }} />
        <Tabs.Screen name="activities" options={{ title: 'Activities', tabBarIcon: ({ color }) => <Feather name="list" color={color} size={21} /> }} />
        <Tabs.Screen name="habits" options={{ title: 'Habits', tabBarIcon: ({ color }) => <Feather name="repeat" color={color} size={21} /> }} />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color }) => <Feather accessible={false} aria-hidden name="bar-chart-2" color={color} size={21} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Feather accessible={false} aria-hidden name="settings" color={color} size={21} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
