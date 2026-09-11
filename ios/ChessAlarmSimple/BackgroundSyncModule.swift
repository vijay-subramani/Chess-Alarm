import Foundation
import UIKit
import React

@objc(BackgroundSyncModule)
class BackgroundSyncModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc func registerBackgroundFetch() {
    DispatchQueue.main.async {
      UIApplication.shared.setMinimumBackgroundFetchInterval(60 * 60 * 6)
    }
  }

  @objc func consumePendingPuzzleSync(
    _ resolve: RCTPromiseResolveBlock,
    reject _: RCTPromiseRejectBlock
  ) {
    resolve(BackgroundSyncStore.consumePending())
  }
}
