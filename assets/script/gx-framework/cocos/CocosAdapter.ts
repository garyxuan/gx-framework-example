/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:30:10
 * @Description: 
 */
import { screen as ccScreen, view } from "cc";
import { Adapter } from "../global/Adapter";
import { debug } from "../tool/Log";
import { size } from "../global/header";
import { _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass('CocosAdapter')
export class CocosAdapter extends Adapter {

    /**
     * 获取屏幕像素尺寸
     * @returns 
     */
    public getScreenSize(): size {
        let windowSize = ccScreen.windowSize;
        return { width: Math.ceil(windowSize.width / view.getScaleX()), height: Math.ceil(windowSize.height / view.getScaleY()) };
    }

    /**
     * 获取设计尺寸
     * @returns 
     */
    public getDesignSize(): size {
        let designSize = view.getDesignResolutionSize();
        return { width: designSize.width, height: designSize.height };
    }

    /**
     * 设置尺寸发生变化的监听
     * @param callback 
     */
    public registerResizeCallback(callback: (...args: any[]) => void): void {
        if (ccScreen && ccScreen.on) {
            ccScreen.on("window-resize", (...args: any) => {
                debug("window-resize");
                callback(...args);
            }, this);
            ccScreen.on("orientation-change", (...args: any) => {
                debug("orientation-change");
                callback(...args);
            }, this);
            ccScreen.on("fullscreen-change", (...args: any) => {
                debug("fullscreen-change");
                callback(...args);
            }, this);
        } else {
            // 3.8.0之前的版本
            view.setResizeCallback(callback);
        }

    }
}
