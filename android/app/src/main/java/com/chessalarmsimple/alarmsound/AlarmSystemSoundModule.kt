package com.chessalarmsimple.alarmsound

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.chessalarmsimple.R

class AlarmSystemSoundModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  private var player: MediaPlayer? = null

  override fun getName(): String = "AlarmSystemSound"

  @ReactMethod
  fun getDeviceSounds(promise: Promise) {
    try {
      val seen = HashSet<String>()
      val list = Arguments.createArray()
      val types = intArrayOf(RingtoneManager.TYPE_ALARM)
      for (type in types) {
        collectDeviceSounds(type, seen, list)
      }
      promise.resolve(list)
    } catch (error: Exception) {
      promise.reject("LIST_ERROR", error.message, error)
    }
  }

  private fun collectDeviceSounds(type: Int, seen: HashSet<String>, list: WritableArray) {
    val manager = RingtoneManager(reactContext)
    manager.setType(type)
    val cursor = manager.cursor ?: return
    while (cursor.moveToNext()) {
      val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)?.trim().orEmpty()
      if (title.isEmpty()) continue
      val uri = manager.getRingtoneUri(cursor.position)?.toString()?.trim().orEmpty()
      if (uri.isEmpty() || seen.contains(uri)) continue
      seen.add(uri)
      val id = cursor.getString(RingtoneManager.ID_COLUMN_INDEX) ?: cursor.position.toString()
      val item = Arguments.createMap()
      item.putString("title", title)
      item.putString("uri", uri)
      item.putString("soundId", id)
      list.pushMap(item)
    }
  }

  @ReactMethod
  fun playBuiltIn(name: String, loop: Boolean, promise: Promise) {
    try {
      stopInternal()
      val mediaPlayer = createBuiltInPlayer(reactContext, name, loop)
        ?: run {
          promise.reject("PLAY_ERROR", "Could not load built-in sound: $name", null)
          return
        }
      mediaPlayer.start()
      player = mediaPlayer
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("PLAY_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun play(uri: String, loop: Boolean, promise: Promise) {
    try {
      stopInternal()
      val mediaPlayer = createUriPlayer(reactContext, uri, loop)
        ?: run {
          promise.reject("PLAY_ERROR", "Could not load sound: $uri", null)
          return
        }
      mediaPlayer.start()
      player = mediaPlayer
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("PLAY_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    stopInternal()
    promise.resolve(null)
  }

  private fun stopInternal() {
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

  companion object {
    /**
     * Static R.raw references are what keep these WAVs in a shrunk release APK — the resource
     * shrinker cannot see name-based lookups, and res/raw/keep.xml is already claimed by the
     * React Native Gradle plugin, so a keep rule of our own would be dropped when resources merge.
     */
    private val BUILT_IN_RAW_RES = mapOf(
      "alarm" to R.raw.alarm,
      "alarm_classic" to R.raw.alarm_classic,
      "alarm_digital" to R.raw.alarm_digital,
      "alarm_gentle" to R.raw.alarm_gentle,
      "alarm_urgent" to R.raw.alarm_urgent,
      "alarm_chime" to R.raw.alarm_chime,
    )

    fun createBuiltInPlayer(context: Context, name: String, loop: Boolean): MediaPlayer? {
      val resId = BUILT_IN_RAW_RES[name]
        ?: context.resources.getIdentifier(name, "raw", context.packageName)
      if (resId == 0) return null

      return try {
        val mediaPlayer = MediaPlayer()
        configureAlarmPlayer(mediaPlayer)
        context.resources.openRawResourceFd(resId).use { afd ->
          mediaPlayer.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
        }
        mediaPlayer.isLooping = loop
        mediaPlayer.prepare()
        mediaPlayer.setVolume(1f, 1f)
        mediaPlayer
      } catch (_: Exception) {
        null
      }
    }

    fun createUriPlayer(context: Context, uriString: String, loop: Boolean): MediaPlayer? {
      if (uriString.isBlank()) return null

      return try {
        MediaPlayer().apply {
          configureAlarmPlayer(this)
          setDataSource(context, Uri.parse(uriString))
          isLooping = loop
          prepare()
          setVolume(1f, 1f)
        }
      } catch (_: Exception) {
        null
      }
    }

    private fun configureAlarmPlayer(mediaPlayer: MediaPlayer) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        mediaPlayer.setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build(),
        )
      } else {
        @Suppress("DEPRECATION")
        mediaPlayer.setAudioStreamType(android.media.AudioManager.STREAM_ALARM)
      }
    }
  }
}
