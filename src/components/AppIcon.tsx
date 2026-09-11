import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type Props = {
  size?: number;
};

/** Chess Alarm app icon — twin-bell clock with pawn on the face. */
export function AppIcon({ size = 48 }: Props) {
  const rx = Math.round(size * 0.22);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="appIconGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#58C040" />
          <Stop offset="100%" stopColor="#2A621A" />
        </LinearGradient>
      </Defs>

      <Rect width="100" height="100" rx={rx} fill="url(#appIconGrad)" />
      <Path d="M15,32 C15,14 43,14 43,32 Z" fill="white" />
      <Path d="M57,32 C57,14 85,14 85,32 Z" fill="white" />
      <Rect x="44" y="18" width="12" height="3.5" rx="1.75" fill="white" />
      <Circle cx="50" cy="19.5" r="4" fill="white" />
      <Circle cx="50" cy="63" r="32" fill="white" />
      <Circle cx="50" cy="63" r="25" fill="url(#appIconGrad)" />
      <Rect x="48.5" y="40.5" width="3" height="5" rx="1.5" fill="white" opacity={0.65} />
      <Rect x="67.5" y="61.5" width="5" height="3" rx="1.5" fill="white" opacity={0.65} />
      <Rect x="48.5" y="80.5" width="3" height="5" rx="1.5" fill="white" opacity={0.65} />
      <Rect x="27.5" y="61.5" width="5" height="3" rx="1.5" fill="white" opacity={0.65} />
      <Circle cx="50" cy="52" r="7.5" fill="white" />
      <Rect x="47.5" y="59.5" width="5" height="4.5" rx="1.2" fill="white" />
      <Path d="M42,64 L58,64 L56,69 L44,69 Z" fill="white" />
      <Path d="M39.5,74 L60.5,74 L58,69 L42,69 Z" fill="white" />
      <Rect x="39.5" y="73" width="21" height="4" rx="2" fill="white" />
      <Rect x="36" y="93" width="28" height="5.5" rx="2.75" fill="white" />
      <Ellipse cx="34.5" cy="96.5" rx="6.5" ry="4.5" fill="white" />
      <Ellipse cx="65.5" cy="96.5" rx="6.5" ry="4.5" fill="white" />
    </Svg>
  );
}
