import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { AlarmEditScreen } from '@/screens/AlarmEditScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { RingScreen } from '@/screens/RingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  initialRoute: keyof RootStackParamList;
  initialRingAlarmId?: string;
};

const stackAnimation = Platform.select({
  ios: 'default' as const,
  android: 'ios_from_right' as const,
  default: 'default' as const,
});

export function RootNavigator({ initialRoute, initialRingAlarmId }: Props) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: stackAnimation,
        animationTypeForReplace: 'push',
        gestureEnabled: true,
        fullScreenGestureEnabled: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AlarmEdit" component={AlarmEditScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="Ring"
        component={RingScreen}
        initialParams={initialRingAlarmId ? { alarmId: initialRingAlarmId } : undefined}
        options={{
          gestureEnabled: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
          fullScreenGestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
