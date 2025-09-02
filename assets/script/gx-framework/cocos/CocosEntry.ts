import { Component, director, game, macro, sys } from "cc";
import { enableDebugMode, FrameConfig } from "../global/header";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:18:53
 * @Description: cocos游戏入口
 */
import { _decorator } from "cc";
import { Platform, PlatformType } from "../global/Platform";
import { CocosAdapter } from "./CocosAdapter";
import { debug, log } from "../tool/Log";
import { Timer } from "../tool/Timer";
import { Time } from "../tool/Time";
import { GlobalTimer } from "../global/GlobalTimer";
import { GlobalEvent } from "../global/GlobalEvent";
const { property } = _decorator;
export abstract class CocosEntry extends Component {
    @property({ displayName: "帧率" })
    fps: number = 60;

    private _innerTimer: Timer = null;

    /**
     * 入口初始化,子类必须实现
     */
    public abstract onInit(): void;

    public getConfig(): FrameConfig {
        return {};
    }

    protected start(): void {
        log("CocosEntry int start");

        const config: FrameConfig = this.getConfig();
        enableDebugMode(config.debug ?? false);

        // 设置游戏帧率
        game.frameRate = this.fps;
        director.addPersistRootNode(this.node);
        this.node.setSiblingIndex(this.node.children.length - 1);
        this.initPlatform();
        this.initTime();
        this.initAdapter();
        log("CocosEntry init finish");
        this.onInit();
    }


    private initPlatform(): void {
        Platform.isNative = sys.isNative;
        Platform.isMobile = sys.isMobile;
        Platform.isNativeMobile = sys.isNative && sys.isMobile;
        switch (sys.os) {
            case sys.OS.ANDROID:
                Platform.isAndroid = true;
                debug("system is Android")
                break;
            case sys.OS.IOS:
                Platform.isIOS = true;
                debug("system is IOS")
                break;
            case sys.OS.OPENHARMONY:
                Platform.isHarmonyOS = true;
                debug("system is HarmonyOS")
                break;
            default:
                break;
        }
        switch (sys.platform) {
            case sys.Platform.WECHAT_GAME:
                Platform.isWX = true;
                Platform.platform = PlatformType.WX;
                break;
            case sys.Platform.ALIPAY_MINI_GAME:
                Platform.isAlipay = true;
                Platform.platform = PlatformType.Alipay;
                break;
            case sys.Platform.BYTEDANCE_MINI_GAME:
                Platform.isBytedance = true;
                Platform.platform = PlatformType.Bytedance;
                break
            case sys.Platform.HUAWEI_QUICK_GAME:
                Platform.isHuaweiQuick = true;
                Platform.platform = PlatformType.HuaweiQuick;
                break;
            default:
                // 其他都设置为浏览器
                Platform.isBrowser = true;
                Platform.platform = PlatformType.Browser;
                break;
        }
        debug(`platform: ${PlatformType[Platform.platform]}`);
    }

    private initAdapter(): void {
        new CocosAdapter().init();
    }

    private initTime(): void {
        Time.init();
        this._innerTimer = new Timer(16);
        GlobalTimer.initTimer();
        this.schedule(this.tick.bind(this), 0, macro.REPEAT_FOREVER);
    }

    private tick(dt: number): void {
        this._innerTimer.update(dt);
        GlobalTimer.update(dt);
    }
}