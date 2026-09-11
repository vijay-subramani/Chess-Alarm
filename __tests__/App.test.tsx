/**
 * @format
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import { formatAlarmTime, formatAlarmMeta } from '../src/services/alarmStore';

test('formatAlarmTime formats 24h to 12h clock', () => {
  expect(formatAlarmTime(6, 30)).toBe('6:30');
  expect(formatAlarmTime(0, 5)).toBe('12:05');
  expect(formatAlarmTime(13, 0)).toBe('1:00');
});

test('formatAlarmMeta builds subtitle', () => {
  const meta = formatAlarmMeta({
    id: '1',
    hour: 6,
    minute: 30,
    label: 'Test',
    days: [1, 2, 3, 4, 5],
    enabled: true,
    sound: { kind: 'builtin', id: 'classic' },
    puzzle: { difficulty: 'easy', mateIn: 1, hintAfter: 1 },
  });
  expect(meta).toContain('Mon – Fri');
  expect(meta).toContain('Mate in 1');
  expect(meta).toContain('Easy');
});
