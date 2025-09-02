import { ResolutionPolicy, view } from "cc";
import { size } from "./header";
import { Screen } from "./Screen";
import { debug } from "../tool/Log";
import { GlobalEvent } from "./GlobalEvent";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:01:56
 * @Description: 
 */
export abstract class Adapter {
    public init() {
        debug("Adapter Init");
        // 设计尺寸不会变化
        let designSize = this.getDesignSize();
        Screen.DesignWidth = designSize.width;
        Screen.DesignHeight = designSize.height;
        view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_WIDTH);

        this.resize();

        this.registerResizeCallback((...args: any) => {
            debug("Adapter resize");
            this.resize();
        })
    }

    public resize() {
        Screen.SafeAreaHeight = 60;
        // 屏幕尺寸
        const winSize = this.getScreenSize();
        const isDesignLandscape = Screen.DesignWidth > Screen.DesignHeight;
        const isLandscape = winSize.width > winSize.height;
        if (isDesignLandscape == isLandscape) {
            Screen.ScreenWidth = winSize.width;
            Screen.ScreenHeight = winSize.height;
        } else {
            Screen.ScreenWidth = winSize.height;
            Screen.ScreenHeight = winSize.width;
        }

        if (isDesignLandscape) {
            // 横屏
            /** 安全区的宽度 */
            Screen.SafeWidth = Screen.ScreenWidth - Screen.SafeAreaHeight * 2;
            /** 安全区的高度 */
            Screen.SafeHeight = Screen.ScreenHeight;
        }
        else {
            // 竖屏
            /** 安全区的宽度 */
            Screen.SafeWidth = Screen.ScreenWidth;
            /** 安全区的高度 */
            Screen.SafeHeight = Screen.ScreenHeight - Screen.SafeAreaHeight * 2;
        }
        this.printScreen();
        // 发送屏幕尺寸发生变化的消息
        GlobalEvent.emit("gx::adapter::resize");
    }

    public printScreen() {
        debug(`Screen.ScreenSize:${Screen.ScreenWidth} * ${Screen.ScreenHeight}`);
        debug(`Screen.DesignSize =${Screen.DesignWidth} * ${Screen.DesignHeight}`);
        debug(`Screen.SafeSize =${Screen.SafeWidth} * ${Screen.SafeHeight}`)
    }

    // 获取屏幕大小
    public abstract getScreenSize(): size;

    // 获取设计屏幕大小
    public abstract getDesignSize(): size;

    // 注册屏幕适配回调
    public abstract registerResizeCallback(callback: () => void): void;
}