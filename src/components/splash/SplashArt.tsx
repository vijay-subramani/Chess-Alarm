import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type ClockProps = {
  size: number;
  faceTop: string;
  faceBottom: string;
};

/** Alarm clock without the pawn — used during the ringing intro. */
export function AlarmClockArt({ size, faceTop, faceBottom }: ClockProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="splashClockFace" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={faceTop} />
          <Stop offset="100%" stopColor={faceBottom} />
        </LinearGradient>
      </Defs>

      <Path d="M15,32 C15,14 43,14 43,32 Z" fill="white" />
      <Path d="M57,32 C57,14 85,14 85,32 Z" fill="white" />
      <Rect x="44" y="18" width="12" height="3.5" rx="1.75" fill="white" />
      <Circle cx="50" cy="19.5" r="4" fill="white" />
      <Circle cx="50" cy="63" r="32" fill="white" />
      <Circle cx="50" cy="63" r="25" fill="url(#splashClockFace)" />
      <Rect x="48.5" y="40.5" width="3" height="5" rx="1.5" fill="white" opacity={0.7} />
      <Rect x="67.5" y="61.5" width="5" height="3" rx="1.5" fill="white" opacity={0.7} />
      <Rect x="48.5" y="80.5" width="3" height="5" rx="1.5" fill="white" opacity={0.7} />
      <Rect x="27.5" y="61.5" width="5" height="3" rx="1.5" fill="white" opacity={0.7} />
      <Line x1="50" y1="63" x2="50" y2="79" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <Line x1="50" y1="63" x2="43" y2="75" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="50" cy="63" r="3" fill="white" />
      <Rect x="36" y="93" width="28" height="5.5" rx="2.75" fill="white" />
      <Ellipse cx="34.5" cy="96.5" rx="6.5" ry="4.5" fill="white" />
      <Ellipse cx="65.5" cy="96.5" rx="6.5" ry="4.5" fill="white" />
    </Svg>
  );
}
