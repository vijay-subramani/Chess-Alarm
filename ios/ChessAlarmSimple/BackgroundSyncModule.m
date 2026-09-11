#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BackgroundSyncModule, NSObject)

RCT_EXTERN_METHOD(registerBackgroundFetch)
RCT_EXTERN_METHOD(consumePendingPuzzleSync:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
