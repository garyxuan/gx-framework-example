/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-09 10:17:16
 * @Description: 
 */
import { sys } from "cc";
import { SingletonClass } from "../tool/Singleton";
import { AdListener, IAdSupport } from "./header";
import { AdMob } from "./support/AdMob";
import { debug } from "../tool/Log";
import { DEBUG } from "cc/env";

export class AdManager extends SingletonClass {
    private _adSupport: IAdSupport = null;
    constructor() {
        debug("AdManager constructor");
        super();
        this._adSupport = new AdMob();
        this._adSupport.init();
    }

    public static Ins() {
        return this.getInstance();
    }

    public setListener(listener?: AdListener): void {
        this._adSupport?.setListener(listener);
    }

    public getAdSupport() {
        return this._adSupport;
    }

    /**
     * 检查广告是否可用
     * @param adUnitId 
     * @returns 
     */
    public isRewardedAdReady(adUnitId: string, callback?: (isReady: boolean) => void): void {
        this._adSupport?.isRewardedAdReady(adUnitId, callback);
    }

    /**
     * 加载激励视频广告
     * @param adUnitId 
     */
    public loadRewardedAd(adUnitId: string): void {
        this._adSupport?.loadRewardedAd(adUnitId);
    }

    /**
     * 显示激励视频广告
     * @param adUnitId 
     * @param listener 
     */
    public showRewardedAd(adUnitId: string) {
        this._adSupport?.showRewardedAd(adUnitId);
    }

    public isInterstitialAdReady(adUnitId: string, callback?: (isReady: boolean) => void): void {
        this._adSupport?.isInterstitialAdReady(adUnitId, callback);
    }

    public loadInterstitialAd(adUnitId: string): void {
        this._adSupport?.loadInterstitialAd(adUnitId);
    }
    /**
     * 显示插屏广告
     * @param adUnitId 
     * @param listener 
     */
    public showInterstitialAd(adUnitId: string): void {
        this._adSupport?.showInterstitialAd(adUnitId);
    }
}

export const AD_CONFIG = {
    adUnitIds: {
        rewardedVideo: "ca-app-pub-8175681423105810/8983492317",
        interstitial: "ca-app-pub-8175681423105810/1133509182",
        banner: ""
    }
};

if (DEBUG) {
    AD_CONFIG.adUnitIds.rewardedVideo = "ca-app-pub-3940256099942544/1712485313";
    AD_CONFIG.adUnitIds.interstitial = "ca-app-pub-3940256099942544/4411468910";
}
