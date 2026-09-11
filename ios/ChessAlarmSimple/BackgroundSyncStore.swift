import Foundation

enum BackgroundSyncStore {
  static let pendingKey = "ChessAlarmPendingPuzzleSync"

  static func markPending() {
    UserDefaults.standard.set(true, forKey: pendingKey)
  }

  static func consumePending() -> Bool {
    let pending = UserDefaults.standard.bool(forKey: pendingKey)
    if pending {
      UserDefaults.standard.set(false, forKey: pendingKey)
    }
    return pending
  }
}
