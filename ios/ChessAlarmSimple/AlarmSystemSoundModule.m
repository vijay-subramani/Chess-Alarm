#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AlarmSystemSound, NSObject)

RCT_EXTERN_METHOD(getDeviceSounds:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(play:(NSString *)uri
                  loop:(BOOL)loop
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
