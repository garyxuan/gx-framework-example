import { Component, director, game, macro, profiler, sys } from "cc";
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
import { ModuleBase } from "../module/ModuleBase";
const { property } = _decorator;
export abstract class CocosEntry extends Component {
    @property({ displayName: "帧率" })
    fps: number = 60;

    // private _innerTimer: Timer = null;

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
        if (config.hideStats) {
            profiler.hideStats();
        }

        // 设置游戏帧率
        game.frameRate = this.fps;
        director.addPersistRootNode(this.node);
        this.node.setSiblingIndex(this.node.children.length - 1);
        this.initPlatform();
        this.initTime();
        this.initAdapter();
        this.initModule();
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
            case sys.OS.OSX:
                Platform.isMacOS = true;
                debug("system is MacOS")
                break;
            case sys.OS.OPENHARMONY:
                Platform.isHarmonyOS = true;
                debug("system is HarmonyOS")
                break;
            default:
                break;
        }
        switch (sys.platform) {
            case sys.Platform.IOS:
                Platform.platform = PlatformType.IOS;
                break;
            case sys.Platform.MACOS:
                Platform.platform = PlatformType.MacOS;
                break;
            case sys.Platform.ANDROID:
                Platform.platform = PlatformType.Android;
                break;
            case sys.Platform.OPENHARMONY:
                Platform.platform = PlatformType.HarmonyOS;
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

    private initModule(): void {
        debug("init module");
        for (const module of this.getComponentsInChildren(ModuleBase)) {
            debug(`init module: ${module.moduleName}`);
            module.init();
        }
    }

    private initTime(): void {
        Time.init();
        // this._innerTimer = new Timer(16);
        GlobalTimer.initTimer();
        this.schedule(this.tick.bind(this), 0, macro.REPEAT_FOREVER);
    }

    private tick(dt: number): void {
        // this._innerTimer.update(dt);
        GlobalTimer.update(dt);
    }
}