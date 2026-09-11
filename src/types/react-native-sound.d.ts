declare module 'react-native-sound' {
  type Callback = (error: Error | null, props?: { duration: number; numberOfChannels: number }) => void;
  type PlayCallback = (success: boolean) => void;

  export default class Sound {
    static MAIN_BUNDLE: string;
    static DOCUMENT: string;
    static LIBRARY: string;
    static CACHES: string;
    static setCategory(category: string, mixWithOthers?: boolean): void;
    constructor(filename: string, basePath: string, callback?: Callback);
    constructor(filename: string, callback?: Callback);
    play(callback?: PlayCallback): void;
    pause(callback?: () => void): void;
    stop(callback?: () => void): void;
    release(): void;
    setVolume(value: number): void;
    setNumberOfLoops(value: number): void;
    getDuration(): number;
    isLoaded(): boolean;
  }
}
