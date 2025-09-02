/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-12 16:12:59
 * @Description: 
 */
import { _decorator, find, Game, game, macro, Node } from 'cc';
import { ModuleBase } from '../module/ModuleBase';
import { debug } from '../tool/Log';
const { ccclass, property } = _decorator;

@ccclass('UIModule')
export class UIModule extends ModuleBase {
    public moduleName: string = "UIModule";

    public init(): void {

    }

    protected onInit(): void {
        debug(`${this.moduleName} init`);
    }

    protected start() {
        this.initEvent()
        this.initData()
        this.initNode()
    }

    /**
     * 获取子节点
     * @param name 节点名称/路径(a/b/c)
     * @returns 节点
     */
    protected child(name: string, parent: Node = this.node): Node {
        return find(name, parent)
    }

    /**
     * 下一帧执行
     * @param callback 回调
     */
    protected nextFrameToDo(callback: Function) {
        this.scheduleOnce(callback, 0)
    }

    /**
     * 延迟执行
     * @param callback 回调
     * @param delay 延迟时间
     */
    protected delayToDo(callback: Function, delay: number = 0) {
        this.scheduleOnce(callback, delay)
    }

    /**
     * 重复执行
     * @param callback 回调
     * @param interval 延迟时间
     * @param count 重复次数
     */
    protected repeatToDo(callback: Function, interval: number = 0, count: number = macro.REPEAT_FOREVER, dealy = 0) {
        this.schedule(callback, interval, count, dealy)
    }

    /**
     * 取消执行
     * @param callback 回调
     */
    protected cancelToDo(callback: Function) {
        this.unschedule(callback)
    }

    /**
     * 取消所有执行
     */
    protected cancelAllToDo() {
        this.unscheduleAllCallbacks()
    }

    /**
     * 初始化事件
     */
    initEvent() {
        game.on(Game.EVENT_HIDE, this.onEventHide, this);
        game.on(Game.EVENT_SHOW, this.onEventShow, this);
    }

    /**
     * 清除事件
     */
    clearEvent() {
        game.off(Game.EVENT_HIDE, this.onEventHide, this);
        game.off(Game.EVENT_SHOW, this.onEventShow, this);
    }

    // 初始化数据
    initData() {

    }

    // 初始化节点
    initNode() {

    }

    /**
     * 进入前台
     */
    onEventShow() {
        console.log("UIModule:onEventShow")
    }

    /**
     * 进入后台
     */
    onEventHide() {
        console.log("UIModule:onEventHide")
    }

    protected onDestroy(): void {
        console.log("UIModule:onDestroy")
        this.cancelAllToDo()
        this.clearEvent()
    }
}

