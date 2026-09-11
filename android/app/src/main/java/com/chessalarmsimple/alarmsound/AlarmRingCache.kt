package com.chessalarmsimple.alarmsound

import android.content.Context

object AlarmRingCache {
  private const val PREFS = "chess_alarm_ring_sounds"

  fun save(context: Context, alarmId: String, configJson: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .putString(key(alarmId), configJson)
      .commit()
  }

  fun load(context: Context, alarmId: String): String? {
    return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .getString(key(alarmId), null)
  }

  fun remove(context: Context, alarmId: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .remove(key(alarmId))
      .commit()
  }

  private fun key(alarmId: String): String = "sound_$alarmId"
}
