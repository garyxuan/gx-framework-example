// import { native, sys } from "cc";
// import { AdListener, IAdSupport } from "../header";
// import { error } from "../../tool/Log";
// /*
//  * @Author: garyxuan
//  * @Version: V1.0
//  * @Date: 2025-09-09 10:21:24
//  * @Description: Unity ads
//  */
// export class UnityAds implements IAdSupport {
//     readonly gameId: string = "xxxx";
//     private _isInit: boolean = false;
//     init(listener?: AdListener): void {
//         this._initNativeAds();
//     }

//     showRewardedAd(adUnitId: string, listener?: AdListener): void {
//         if (!this._isInit) {
//             error("showRewardedAd,Unity Ads not initialized")
//             return;
//         }
//         // 原生代码调用
//         if (sys.isNative) {
//             if (sys.os === sys.OS.ANDROID) {
//                 native.reflection.callStaticMethod(
//                     "com/unity3d/ads/UnityAds",
//                     "show",
//                     "(Landroid/app/Activity;Ljava/lang/String;)V",
//                     adUnitId
//                 );
//             } else if (sys.os === sys.OS.IOS) {
//                 native.reflection.callStaticMethod(
//                     "UnityAds",
//                     "show:",
//                     adUnitId
//                 );
//             }
//         }
//     }

//     isAdReady(adUnitId: string): boolean {
//         if (!this._isInit) {
//             error("showRewardedAd,Unity Ads not initialized")
//             return;
//         }
//         // 原生代码调用
//         if (sys.isNative) {
//             if (sys.os === sys.OS.ANDROID) {
//                 return native.reflection.callStaticMethod(
//                     "com/unity3d/ads/UnityAds",
//                     "isReady",
//                     "(Landroid/app/Activity;Ljava/lang/String;)V",
//                     adUnitId
//                 );
//             } else if (sys.os === sys.OS.IOS) {
//                 native.reflection.callStaticMethod(
//                     "UnityAds",
//                     "isReady:",
//                     adUnitId
//                 );
//             }
//         }
//         return false;
//     }

//     private _initNativeAds(): void {
//         // 原生代码调用
//         if (sys.isNative) {
//             if (sys.os === sys.OS.ANDROID) {
//                 // Android原生调用
//                 native.reflection.callStaticMethod(
//                     "com/unity3d/ads/UnityAds",
//                     "initialize",
//                     "(Ljava/lang/String;Z)V",
//                     this.gameId,
//                     false
//                 );
//             } else if (sys.os === sys.OS.IOS) {
//                 // iOS原生调用
//                 native.reflection.callStaticMethod(
//                     "UnityAds",
//                     "initialize:testMode:",
//                     this.gameId,
//                     false
//                 );
//             }
//             this._isInit = true;
//         }
//     }
// }