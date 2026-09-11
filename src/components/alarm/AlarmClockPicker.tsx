import { useCallback, useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import type { AppColors } from '@/theme/tokens';
import { fonts, spacing } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const PAD = Math.floor(VISIBLE_ROWS / 2);

type Period = 'AM' | 'PM';

type Props = {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
};

function to12Hour(hour24: number) {
  const period: Period = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, period };
}

function to24Hour(hour12: number, period: Period) {
  let hour = hour12 % 12;
  if (period === 'PM') hour += 12;
  return hour;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS: Period[] = ['AM', 'PM'];

type WheelProps<T> = {
  values: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  format: (value: T) => string;
  width?: number;
};

function indexFromOffset(offsetY: number, maxIndex: number) {
  const index = Math.round(offsetY / ITEM_HEIGHT);
  return Math.max(0, Math.min(maxIndex, index));
}

function WheelColumn<T>({ values, selectedIndex, onSelect, format, width = 72 }: WheelProps<T>) {
  const styles = useThemedStyles(createStyles);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const committedIndexRef = useRef(selectedIndex);
  const isDraggingRef = useRef(false);
  const didMountRef = useRef(false);
  const maxIndex = values.length - 1;

  const scrollToIndex = useCallback((index: number, animated = false) => {
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated,
    });
  }, []);

  const commitIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(maxIndex, index));
      committedIndexRef.current = clamped;
      onSelect(clamped);
    },
    [maxIndex, onSelect],
  );

  const snapToNearest = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>, animated: boolean) => {
      const clamped = indexFromOffset(event.nativeEvent.contentOffset.y, maxIndex);
      scrollToIndex(clamped, animated);
      commitIndex(clamped);
    },
    [commitIndex, maxIndex, scrollToIndex],
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      committedIndexRef.current = selectedIndex;
      scrollToIndex(selectedIndex, false);
      return;
    }
    if (committedIndexRef.current === selectedIndex) return;
    committedIndexRef.current = selectedIndex;
    scrollToIndex(selectedIndex, false);
  }, [scrollToIndex, selectedIndex]);

  const onScrollBeginDrag = () => {
    isDraggingRef.current = true;
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = event.nativeEvent.velocity?.y ?? 0;
    if (Math.abs(velocityY) > 0.05) {
      return;
    }

    isDraggingRef.current = false;
    snapToNearest(event, true);
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    snapToNearest(event, true);
  };

  const onItemPress = (index: number) => {
    committedIndexRef.current = index;
    commitIndex(index);
    scrollToIndex(index, false);
  };

  return (
    <View style={[styles.column, { width }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        bounces={false}
        nestedScrollEnabled
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ paddingVertical: PAD * ITEM_HEIGHT }}
      >
        {values.map((item, index) => {
          const selected = index === selectedIndex;
          return (
            <Pressable
              key={index}
              onPress={() => onItemPress(index)}
              style={styles.item}
            >
              <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                {format(item)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function AlarmClockPicker({ hour, minute, onChange }: Props) {
  const styles = useThemedStyles(createStyles);
  const { hour12, period } = to12Hour(hour);
  const hourIndex = HOURS.indexOf(hour12);
  const minuteIndex = MINUTES.indexOf(minute);
  const periodIndex = PERIODS.indexOf(period);

  const emit = (nextHour12: number, nextMinute: number, nextPeriod: Period) => {
    onChange(to24Hour(nextHour12, nextPeriod), nextMinute);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.highlight} pointerEvents="none" />
      <View style={styles.columns}>
        <WheelColumn
          values={HOURS}
          selectedIndex={hourIndex >= 0 ? hourIndex : 0}
          onSelect={index => emit(HOURS[index], minute, period)}
          format={value => String(value)}
          width={80}
        />
        <Text style={styles.separator}>:</Text>
        <WheelColumn
          values={MINUTES}
          selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
          onSelect={index => emit(hour12, MINUTES[index], period)}
          format={value => String(value).padStart(2, '0')}
          width={80}
        />
        <WheelColumn
          values={PERIODS}
          selectedIndex={periodIndex >= 0 ? periodIndex : 0}
          onSelect={index => emit(hour12, minute, PERIODS[index])}
          format={value => value}
          width={64}
        />
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      height: WHEEL_HEIGHT,
      marginVertical: spacing.md,
      position: 'relative',
    },
    columns: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    column: {
      height: WHEEL_HEIGHT,
      overflow: 'hidden',
    },
    item: {
      height: ITEM_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemText: {
      fontFamily: fonts.ui,
      fontSize: 22,
      color: colors.muted,
      fontVariant: ['tabular-nums'],
    },
    itemTextSelected: {
      fontFamily: fonts.display,
      fontSize: 32,
      fontWeight: '700',
      color: colors.ink,
    },
    separator: {
      fontFamily: fonts.display,
      fontSize: 32,
      fontWeight: '700',
      color: colors.ink,
      marginHorizontal: 4,
      marginBottom: 2,
    },
    highlight: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      top: PAD * ITEM_HEIGHT,
      height: ITEM_HEIGHT,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primary,
    },
  });
}
