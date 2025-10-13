import { Timer } from "../tool/Timer";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-29 13:45:19
 * @Description: 全局定时器
 */
export class GlobalTimer {
    /**
     * 全局定时器实例
     * @internal
     */
    private static _timer: Timer = null;

    /**
     * 初始化全局定时器，设置定时器间隔为16毫秒。
     * 此方法用于启动一个定时器实例，以便在整个应用程序中跟踪时间相关的操作。
     * @internal
     */
    public static initTimer() {
        this._timer = new Timer(16);
    }

    /**
     * 获取全局定时器实例，如果没有则初始化。
     * 用于在其他模块中访问定时器功能。
     * @returns 定时器实例
     * @internal
     */
    public static get timer() {
        if (this._timer == null) {
            this.initTimer();
        }
        return this._timer;
    }

    /**
     * 启动一个定时器，返回定时器ID。
     * 用于在其他模块中启动定时器，使用定时器ID可以暂停、恢复、停止定时器。
     * @param callback 定时器回调函数 dt:时间间隔（秒）
     * @param interval 定时器间隔时间，以秒为单位
     * @param loop [loop=0] 重复次数：0：回调一次，1~n：回调n次，-1：无限重复
     * @returns 定时器ID
     */
    public static startTimer(callback: (dt: number) => void, interval: number, loop: number = 0): number {
        return this._timer.start(callback, interval, loop);
    }

    /**
     * 停止一个定时器，使用定时器ID。
     * 用于在其他模块中停止定时器。
     * @param timerId 定时器ID
     */
    public static stopTimer(timerId: number): void {
        this._timer.stop(timerId);
    }

    /**
     * 暂停一个定时器，使用定时器ID。
     * 用于在其他模块中暂停定时器。
     * @param timerId 定时器ID
     */
    public static pauseTimer(timerId: number): void {
        this._timer.pause(timerId);
    }

    /**
     * 恢复一个定时器，使用定时器ID。
     * 用于在其他模块中恢复定时器。
     * @param timerId 定时器ID
     */
    public static resumeTimer(timerId: number): void {
        this._timer.resume(timerId);
    }

    /**
     * 清除所有定时器。
     * 用于在其他模块中清除所有定时器。
     */
    public static clearTimer(): void {
        this._timer.clear();
    }

    /**
     * 更新全局定时器，更新定时器内部状态。
     * 用于在其他模块中更新定时器状态。
     * @param dt 时间间隔，以秒为单位
     */
    public static update(dt: number): void {
        this._timer.update(dt);
    }
}