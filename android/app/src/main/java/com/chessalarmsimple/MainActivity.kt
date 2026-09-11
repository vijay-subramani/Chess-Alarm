package com.chessalarmsimple

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.chessalarmsimple.alarmsound.AlarmRingForegroundService
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme)
    prepareForAlarmLaunch(intent)
    super.onCreate(savedInstanceState)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    prepareForAlarmLaunch(intent)
  }

  private fun prepareForAlarmLaunch(intent: Intent?) {
    val alarmId = intent?.getStringExtra(AlarmRingForegroundService.EXTRA_ALARM_ID)
    if (alarmId.isNullOrBlank()) return

    AlarmLaunchStore.setPending(alarmId)
    showOverLockScreen()
  }

  private fun showOverLockScreen() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
      )
    }
  }

  override fun getMainComponentName(): String = "ChessAlarmSimple"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
