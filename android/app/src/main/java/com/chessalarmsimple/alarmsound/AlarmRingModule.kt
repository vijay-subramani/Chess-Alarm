package com.chessalarmsimple.alarmsound

import android.content.Intent
import android.os.Build
import com.chessalarmsimple.AlarmLaunchStore
import com.chessalarmsimple.MainActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AlarmRingModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AlarmRing"

  @ReactMethod
  fun cacheAlarmSound(alarmId: String, configJson: String, promise: Promise) {
    try {
      AlarmRingCache.save(reactContext, alarmId, configJson)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("CACHE_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun getLaunchAlarmId(promise: Promise) {
    promise.resolve(AlarmLaunchStore.consumePending())
  }

  @ReactMethod
  fun getActiveAlarmId(promise: Promise) {
    promise.resolve(
      AlarmRingForegroundService.activeAlarmId ?: inAppActiveAlarmId,
    )
  }

  @ReactMethod
  fun startInAppAlarmRing(alarmId: String, configJson: String, promise: Promise) {
    try {
      if (configJson.isNotBlank()) {
        AlarmRingCache.save(reactContext, alarmId, configJson)
      }
      val resolvedConfig = configJson.takeIf { it.isNotBlank() }
        ?: AlarmRingCache.load(reactContext, alarmId)
      AlarmRingPlayer.start(reactContext, resolvedConfig)
      if (!AlarmRingPlayer.isPlaying()) {
        promise.reject("START_ERROR", "Could not start in-app alarm audio", null)
        return
      }
      inAppActiveAlarmId = alarmId
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("START_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun startAlarmRing(
    alarmId: String,
    configJson: String,
    launchApp: Boolean,
    promise: Promise,
  ) {
    try {
      if (configJson.isNotBlank()) {
        AlarmRingCache.save(reactContext, alarmId, configJson)
      }
      inAppActiveAlarmId = null
      val serviceIntent = Intent(reactContext, AlarmRingForegroundService::class.java).apply {
        putExtra(AlarmRingForegroundService.EXTRA_ALARM_ID, alarmId)
        if (configJson.isNotBlank()) {
          putExtra(AlarmRingForegroundService.EXTRA_CONFIG_JSON, configJson)
        }
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(serviceIntent)
      } else {
        reactContext.startService(serviceIntent)
      }

      if (launchApp) {
        launchRingActivity(alarmId)
      }

      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("START_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun launchAlarmRing(alarmId: String, promise: Promise) {
    try {
      launchRingActivity(alarmId)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("LAUNCH_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun isAlarmRinging(promise: Promise) {
    promise.resolve(AlarmRingPlayer.isPlaying())
  }

  @ReactMethod
  fun stopAlarmRing(promise: Promise) {
    try {
      AlarmRingPlayer.stop()
      inAppActiveAlarmId = null
      reactContext.stopService(Intent(reactContext, AlarmRingForegroundService::class.java))
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("STOP_ERROR", error.message, error)
    }
  }

  private fun launchRingActivity(alarmId: String) {
    AlarmLaunchStore.setPending(alarmId)
    val launchIntent = Intent(reactContext, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_SINGLE_TOP or
        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
      putExtra(AlarmRingForegroundService.EXTRA_ALARM_ID, alarmId)
    }
    reactContext.startActivity(launchIntent)
  }

  companion object {
    @Volatile
    var inAppActiveAlarmId: String? = null
  }
}
