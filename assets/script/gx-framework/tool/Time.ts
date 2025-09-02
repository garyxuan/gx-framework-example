import { game } from "cc";
import { log } from "./Log";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 19:48:00
 * @Description:
 */

/** 时间对象缓存 */
let TimeCache: Date = null;

export class Time {

    /** 
     * 获取当前毫秒时间戳
     */
    private static _nowTimestamp: () => number;

    /** 
     * 游戏系统启动时间戳
     */
    private static _osBootTime: number = 0;

    /** 
     * 主动设置的网络时间 单位ms
     */
    private static _netTime: number = 0;

    /** 
     * 本地时间与网路时间的偏移量 单位ms
     */
    private static _netTimeDiff: number = 0;

    /** 获取本地时间与网路时间的偏移量 单位ms */
    public static get netTimeDiff(): number { return this._netTimeDiff; }

    /** 获取系统运行时间 */
    public static get runTime(): number { return Math.floor(game.totalTime); }

    public static init() {
        this._osBootTime = Math.floor(Date.now());
        log("Time init, osBootTime: " + this._osBootTime);
        TimeCache = new Date();
        this._nowTimestamp = (): number => {
            return this._osBootTime + this.runTime;
        }
    }

    /**
     * 获取当前时间 单位ms
     */
    public static now(): number {
        return this._nowTimestamp() + this.netTimeDiff;
    }


    /**
     * 将毫秒转换为秒
     * @param ms 毫秒
     */
    public static msTos(ms: number): number {
        return Math.floor((ms || 0) / 1000);
    }

    /**
     * 将秒转换为毫秒
     */
    public static sToMs(s: number): number {
        return (s || 0) * 1000;
    }
}