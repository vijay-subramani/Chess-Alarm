import AVFoundation
import Foundation
import React

private enum AlarmRingCache {
  private static let defaults = UserDefaults.standard
  private static let prefix = "chess_alarm_ring_sound_"

  static func save(alarmId: String, configJson: String) {
    defaults.set(configJson, forKey: prefix + alarmId)
  }

  static func load(alarmId: String) -> String? {
    defaults.string(forKey: prefix + alarmId)
  }
}

@objc(AlarmRing)
class AlarmRing: NSObject {
  private static var player: AVAudioPlayer?
  private static var activeAlarmId: String?

  @objc static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc func cacheAlarmSound(
    _ alarmId: String,
    configJson: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    AlarmRingCache.save(alarmId: alarmId, configJson: configJson)
    resolve(nil)
  }

  @objc func startAlarmRing(
    _ alarmId: String,
    launchApp: Bool,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard
      let configJson = AlarmRingCache.load(alarmId: alarmId),
      let data = configJson.data(using: .utf8),
      let config = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else {
      reject("START_ERROR", "No cached alarm sound for \(alarmId)", nil)
      return
    }

    do {
      try configureAlarmSession()

      let kind = config["kind"] as? String ?? "builtin"
      let player: AVAudioPlayer

      switch kind {
      case "builtin":
        let rawName = config["id"] as? String ?? "alarm_classic.wav"
        let filename = rawName.contains(".") ? rawName : "\(rawName).wav"
        let base = (filename as NSString).deletingPathExtension
        let ext = (filename as NSString).pathExtension.isEmpty ? "wav" : (filename as NSString).pathExtension
        guard let url = Bundle.main.url(forResource: base, withExtension: ext) else {
          reject("START_ERROR", "Missing bundled alarm sound \(filename)", nil)
          return
        }
        player = try AVAudioPlayer(contentsOf: url)
      case "system", "custom":
        guard let uri = config["uri"] as? String else {
          reject("START_ERROR", "Missing alarm sound URI", nil)
          return
        }
        let url: URL
        if uri.hasPrefix("/") {
          url = URL(fileURLWithPath: uri)
        } else if let parsed = URL(string: uri) {
          url = parsed
        } else {
          reject("START_ERROR", "Invalid alarm sound URI", nil)
          return
        }
        player = try AVAudioPlayer(contentsOf: url)
      default:
        reject("START_ERROR", "Unsupported alarm sound kind", nil)
        return
      }

      AlarmRing.stopPlayer()

      player.numberOfLoops = -1
      player.volume = 1
      player.prepareToPlay()
      player.play()
      AlarmRing.player = player
      AlarmRing.activeAlarmId = alarmId
      resolve(nil)
    } catch {
      reject("START_ERROR", error.localizedDescription, error)
    }
  }

  @objc func launchAlarmRing(
    _ alarmId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(nil)
  }

  @objc func getLaunchAlarmId(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(AlarmRing.activeAlarmId)
  }

  @objc func getActiveAlarmId(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(AlarmRing.activeAlarmId)
  }

  @objc func isAlarmRinging(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(AlarmRing.player?.isPlaying == true)
  }

  @objc func stopAlarmRing(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    AlarmRing.stopPlayer()
    resolve(nil)
  }

  private static func stopPlayer() {
    player?.stop()
    player = nil
    activeAlarmId = nil
  }

  private func configureAlarmSession() throws {
    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.playback, mode: .default, options: [.defaultToSpeaker])
    try session.setActive(true, options: [])
    try session.overrideOutputAudioPort(.speaker)
  }
}
