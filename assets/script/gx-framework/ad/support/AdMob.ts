/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-09 10:21:19
 * @Description:google admob
 */
import { native, sys } from "cc";
import { AdListener, IAdSupport } from "../header";
import { debug } from "../../tool/Log";
import { DEBUG } from "cc/env";

export class AdMob implements IAdSupport {
    private _listener: AdListener = null;
    private _rewardedAdReadyCallback: (isReady: boolean) => void = null;
    private _interstitialAdReadyCallback: (isReady: boolean) => void = null;
    init(): void {
        // 原生代码调用
        if (sys.isNative) {
            native.bridge.onNative = (arg0: string, arg1: string): void => {
                debug("native.bridge.onNative arg0 agr1", arg0, arg1);
                if (arg0 == 'isRewardedAdReady') {
                    debug("isRewardedAdReady", arg1);
                    this._rewardedAdReadyCallback?.(arg1.toString() == "true");
                }
                else if (arg0 == 'isInterstitialAdReady') {
                    debug("isInterstitialAdReady", arg1);
                    this._interstitialAdReadyCallback?.(arg1.toString() == "true");
                }
                else if (arg0 == 'loadRewardedAdError') {
                    debug("loadRewardedAdError", arg1);
                    this._listener?.onAdLoadFail?.("", 0, arg1);
                }
                else if (arg0 == 'loadInterstitialAdError') {
                    debug("loadInterstitialAdError", arg1);
                    this._listener?.onAdLoadFail?.("", 0, arg1);
                }
                else if (arg0 == 'userDidEarnReward') {
                    let [type, _] = arg1.split(':')
                    let amount = Number(_).toFixed(0);
                    debug("type", type)
                    debug("amount", amount);
                    this._listener?.onAdRewarded?.("");
                }
                else if (arg0 == 'adDidRecordClick') {
                    debug("adDidRecordClick", arg1);
                    this._listener?.onAdClick?.("");
                }
                else if (arg0 == 'adWillPresentFullScreenContent') {
                    debug("adWillPresentFullScreenContent", arg1);
                    this._listener?.onAdShowSuccess?.("");
                }
                else if (arg0 == 'adDidDismissFullScreenContent') {
                    debug("adDidDismissFullScreenContent");
                    this._listener?.onAdClose?.("");
                }
                else if (arg0 == 'didFailToPresentFullScreenContentWithError') {
                    debug("didFailToPresentFullScreenContentWithError", arg1);
                    this._listener?.onAdShowFail?.("", 0, arg1);
                }
            }
        }
    }

    setListener(listener?: AdListener): void {
        this._listener = listener;
    }

    isRewardedAdReady(adUnitId: string, callback?: (isReady: boolean) => void) {
        if (sys.isNative) {
            this._rewardedAdReadyCallback = callback;
            native.bridge.sendToNative("isRewardedAdReady", adUnitId);
        }
        else {
            callback?.(true);
        }
    }

    loadRewardedAd(adUnitId: string): void {
        if (sys.isNative) {
            native.bridge.sendToNative("loadRewardedAd", adUnitId);
        }
    }

    showRewardedAd(adUnitId: string): void {
        if (sys.isNative) {
            native.bridge.sendToNative("showRewardedAd", adUnitId);
        }
        else {
            this._listener?.onAdRewarded?.(adUnitId);
        }
    }

    isInterstitialAdReady(adUnitId: string, callback?: (isReady: boolean) => void) {
        if (sys.isNative) {
            this._interstitialAdReadyCallback = callback;
            native.bridge.sendToNative("isInterstitialAdReady", adUnitId);
        }
    }

    loadInterstitialAd(adUnitId: string): void {
        if (sys.isNative) {
            native.bridge.sendToNative("loadInterstitialAd", adUnitId);
        }
    }

    showInterstitialAd(adUnitId: string): void {
        if (sys.isNative) {
            native.bridge.sendToNative("showInterstitialAd", adUnitId);
        }
    }

}
