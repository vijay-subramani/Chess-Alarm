package com.chessalarmsimple

object AlarmLaunchStore {
  @Volatile
  var pendingAlarmId: String? = null

  fun setPending(alarmId: String?) {
    pendingAlarmId = alarmId?.takeIf { it.isNotBlank() }
  }

  fun consumePending(): String? {
    val id = pendingAlarmId
    pendingAlarmId = null
    return id
  }
}
