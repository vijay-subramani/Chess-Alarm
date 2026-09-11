/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import {
  handleAlarmBackgroundEvent,
  registerAlarmForegroundService,
} from './src/services/alarmForegroundService';

registerAlarmForegroundService();

notifee.onBackgroundEvent(async ({ type, detail }) => {
  await handleAlarmBackgroundEvent(type, detail.notification);
});

AppRegistry.registerComponent(appName, () => App);
