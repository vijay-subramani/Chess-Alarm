package com.chessalarmsimple.alarmsound

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.chessalarmsimple.MainActivity
import com.chessalarmsimple.R

class AlarmRingForegroundService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val alarmId = intent?.getStringExtra(EXTRA_ALARM_ID)
    if (alarmId.isNullOrBlank()) {
      stopSelf()
      return START_NOT_STICKY
    }

    activeAlarmId = alarmId
    ensureChannel()
    val notification = buildNotification(alarmId)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        notificationIdFor(alarmId),
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
      )
    } else {
      startForeground(notificationIdFor(alarmId), notification)
    }

    val configJson = intent?.getStringExtra(EXTRA_CONFIG_JSON)
      ?: AlarmRingCache.load(this, alarmId)
    AlarmRingPlayer.start(this, configJson)
    return START_STICKY
  }

  override fun onDestroy() {
    AlarmRingPlayer.stop()
    activeAlarmId = null
    super.onDestroy()
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java) ?: return
    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      "Alarms",
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "Chess Alarm ringing"
      setBypassDnd(true)
      setSound(null, null)
      enableVibration(true)
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    }
    manager.createNotificationChannel(channel)
  }

  private fun buildNotification(alarmId: String): Notification {
    val launchIntent = Intent(this, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_SINGLE_TOP or
        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
      putExtra(EXTRA_ALARM_ID, alarmId)
    }
    val pendingIntent = PendingIntent.getActivity(
      this,
      alarmId.hashCode(),
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val builder = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentTitle(getString(R.string.app_name))
      .setContentText("Alarm ringing — tap to solve the puzzle")
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)
      .setContentIntent(pendingIntent)
      .setFullScreenIntent(pendingIntent, true)
      .setWhen(System.currentTimeMillis())
      .setShowWhen(true)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      builder.foregroundServiceBehavior = NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE
    }

    return builder.build()
  }

  companion object {
    const val EXTRA_ALARM_ID = "alarmId"
    const val EXTRA_CONFIG_JSON = "configJson"
    private const val CHANNEL_ID = "chess_alarm_ring_service"
    @Volatile
    var activeAlarmId: String? = null

    fun notificationIdFor(alarmId: String): Int = 9100 + (alarmId.hashCode() and 0xFF)
  }
}
