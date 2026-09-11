# React Native + library keeps (consumer rules from deps are merged automatically).
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStripAny
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep @com.facebook.proguard.annotations.DoNotStripAny class * {
    *;
}
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Notifee / alarm notifications
-keep class io.invertase.notifee.** { *; }

# Skia
-keep class com.shopify.reactnative.skia.** { *; }

# AsyncStorage, native modules
-keep class com.reactnativecommunity.** { *; }

-dontwarn com.facebook.react.**

# Chess Alarm native audio modules
-keep class com.chessalarmsimple.alarmsound.** { *; }
