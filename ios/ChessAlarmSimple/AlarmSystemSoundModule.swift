import AVFoundation
import Foundation
import React

@objc(AlarmSystemSound)
class AlarmSystemSound: NSObject {
  private var player: AVAudioPlayer?

  @objc static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc func getDeviceSounds(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.global(qos: .userInitiated).async {
      var results: [[String: String]] = []
      var seen = Set<String>()
      let audioExtensions: Set<String> = ["caf", "wav", "aiff", "aif", "mp3", "m4r", "m4a"]

      func appendSounds(from directoryPath: String) {
        let directory = URL(fileURLWithPath: directoryPath, isDirectory: true)
        guard
          let urls = try? FileManager.default.contentsOfDirectory(
            at: directory,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
          )
        else {
          return
        }

        for url in urls {
          let isDirectory = (try? url.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) ?? false
          if isDirectory { continue }

          let ext = url.pathExtension.lowercased()
          if !audioExtensions.contains(ext) { continue }

          let uri = url.absoluteString
          if seen.contains(uri) { continue }
          seen.insert(uri)

          var title = url.deletingPathExtension().lastPathComponent
          title = title.replacingOccurrences(of: "_", with: " ")
          title = title.replacingOccurrences(of: "-", with: " ")

          results.append([
            "title": title,
            "uri": uri,
            "soundId": uri,
          ])
        }
      }

      appendSounds(from: "/Library/Ringtones")

      results.sort { $0["title"] ?? "" < $1["title"] ?? "" }

      DispatchQueue.main.async {
        resolve(results)
      }
    }
  }

  @objc func play(
    _ uri: String,
    loop: Bool,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let url = URL(string: uri) else {
      reject("PLAY_ERROR", "Invalid sound URI", nil)
      return
    }

    do {
      try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
      try AVAudioSession.sharedInstance().setActive(true)
      player?.stop()
      let next = try AVAudioPlayer(contentsOf: url)
      next.numberOfLoops = loop ? -1 : 0
      next.prepareToPlay()
      next.play()
      player = next
      resolve(nil)
    } catch {
      reject("PLAY_ERROR", error.localizedDescription, error)
    }
  }

  @objc func stop(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    player?.stop()
    player = nil
    resolve(nil)
  }
}
