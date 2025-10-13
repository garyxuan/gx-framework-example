/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-09 10:17:55
 * @Description: 
 */

import { sys } from "cc";

/**
 * 广告事件监听器接口
 * 用于接收广告加载、展示、关闭、奖励等事件的回调
 */
export interface AdListener {
    /**
     * 广告加载成功回调
     * @param adUnitId 广告位ID
     */
    onAdLoadSuccess?: (adUnitId: string) => void;
    /**
     * 广告加载失败回调
     * @param adUnitId 广告位ID
     * @param errorCode 错误码
     * @param errorMessage 错误信息
     */
    onAdLoadFail?: (adUnitId: string, errorCode: number, errorMessage: string) => void;
    /**
     * 广告展示成功回调
     * @param adUnitId 广告位ID
     */
    onAdShowSuccess?: (adUnitId: string) => void;
    /**
     * 广告展示失败回调
     * @param adUnitId 广告位ID
     * @param errorCode 错误码
     * @param errorMessage 错误信息
     */
    onAdShowFail?: (adUnitId: string, errorCode: number, errorMessage: string) => void;
    /**
     * 广告点击回调
     * @param adUnitId 广告位ID
     */
    onAdClick?: (adUnitId: string) => void;
    /**
     * 广告关闭回调
     * @param adUnitId 广告位ID
     */
    onAdClose?: (adUnitId: string) => void;
    /**
     * 激励视频广告奖励发放回调
     * @param adUnitId 广告位ID
     */
    onAdRewarded?: (adUnitId: string) => void;
}

// /**
//  * 广告管理抽象接口
//  * 定义了广告管理的核心功能，可兼容多种广告提供商
//  */
// interface IAdManager {
//     /**
//      * 初始化广告SDK
//      * @param config 初始化配置，例如App ID、渠道信息等
//      * @param listener 全局广告事件监听器，可选
//      */
//     init(config: any, listener?: AdListener): void;

//     /**
//      * 加载横幅广告
//      * @param adUnitId 广告位ID
//      * @param options 其他选项，例如横幅广告的位置、尺寸等
//      */
//     loadBannerAd(adUnitId: string, options?: any): void;

//     /**
//      * 显示横幅广告
//      * @param adUnitId 广告位ID
//      */
//     showBannerAd(adUnitId: string): void;

//     /**
//      * 隐藏横幅广告
//      * @param adUnitId 广告位ID
//      */
//     hideBannerAd(adUnitId: string): void;

//     /**
//      * 销毁横幅广告
//      * @param adUnitId 广告位ID
//      */
//     destroyBannerAd(adUnitId: string): void;

//     /**
//      * 加载插屏广告
//      * @param adUnitId 广告位ID
//      */
//     loadInterstitialAd(adUnitId: string): void;

//     /**
//      * 显示插屏广告
//      * @param adUnitId 广告位ID
//      * @param listener 特定广告的事件监听器，会覆盖全局监听器，可选
//      */
//     showInterstitialAd(adUnitId: string, listener?: AdListener): void;

//     /**
//      * 加载激励视频广告
//      * @param adUnitId 广告位ID
//      */
//     loadRewardedVideoAd(adUnitId: string): void;

//     /**
//      * 显示激励视频广告
//      * @param adUnitId 广告位ID
//      * @param listener 特定广告的事件监听器，会覆盖全局监听器，可选
//      */
//     showRewardedAd(adUnitId: string, listener?: AdListener): void;

//     /**
//      * 检查某个广告位是否已加载并准备好显示
//      * @param adUnitId 广告位ID
//      * @returns 如果广告已准备好则返回true，否则返回false
//      */
//     isAdReady(adUnitId: string): boolean;
// }

/**
 * 广告支持接口
 * 定义了广告支持的核心功能，可兼容多种广告提供商
 */
export interface IAdSupport {
    // 初始化广告SDK 例如App ID、渠道信息等
    init(): void;
    // 设置广告事件监听器
    setListener(listener?: AdListener): void;
    // // 加载横幅广告 options 其他选项，例如横幅广告的位置、尺寸等
    // loadBannerAd?(adUnitId: string, options?: any): void;
    // // 显示横幅广告
    // showBannerAd?(adUnitId: string): void;
    // // 隐藏横幅广告
    // hideBannerAd?(adUnitId: string): void;
    // // 销毁横幅广告
    // destroyBannerAd?(adUnitId: string): void;
    // 检查插屏广告是否已加载并准备好显示
    isInterstitialAdReady?(adUnitId: string, callback?: (isReady: boolean) => void): void;
    // 加载插屏广告
    loadInterstitialAd?(adUnitId: string): void;
    // 显示插屏广告
    showInterstitialAd?(adUnitId: string): void;
    // 检查激励视频广告是否已加载并准备好显示
    isRewardedAdReady?(adUnitId: string, callback?: (isReady: boolean) => void): void;
    // 加载激励视频广告
    loadRewardedAd?(adUnitId: string): void;
    // 显示激励视频广告
    showRewardedAd?(adUnitId: string): void;
}

// export interface ADConfig {
//     gameId: string,
//     placements: {
//         rewardedVideo: string,
//         interstitial: string,
//         banner: string,
//     }
// }
