package com.chessalarmsimple.alarmsound

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import org.json.JSONObject

object AlarmRingPlayer {
  private var player: MediaPlayer? = null

  @Synchronized
  fun start(context: Context, configJson: String?) {
    if (configJson.isNullOrBlank()) return

    val config = JSONObject(configJson)
    val kind = config.optString("kind", "builtin")
    val mediaPlayer = when (kind) {
      "builtin" -> AlarmSystemSoundModule.createBuiltInPlayer(
        context,
        config.optString("id", "alarm_classic"),
        true,
      )
      "system", "custom" -> AlarmSystemSoundModule.createUriPlayer(
        context,
        config.optString("uri", ""),
        true,
      )
      else -> null
    } ?: return

    stop()
    mediaPlayer.start()
    player = mediaPlayer
  }

  @Synchronized
  fun stop() {
    player?.run {
      try {
        if (isPlaying) {
          stop()
        }
      } catch (_: Exception) {
        // ignore
      }
      release()
    }
    player = null
  }

  @Synchronized
  fun isPlaying(): Boolean = player?.isPlaying == true
}
