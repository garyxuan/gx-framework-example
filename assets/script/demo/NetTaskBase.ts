import { IHttpResponse } from "../gx-framework/network/http/header";
import { HttpTask } from "../gx-framework/network/http/HttpTask";
import { debug } from "../gx-framework/tool/Log";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-01 16:55:49
 * @Description: 网络任务基类
 */
export abstract class NetTaskBase extends HttpTask {
    /**
     * 任务请求地址
     */
    protected url: string = '';
    /**
     * 任务成功回调
     * @param data 
     */
    private _onSucceed: (data: any) => void;
    /**
     * 任务失败回调
     * @param message 
     */
    private _onFail: (data: any) => void;

    /**
     * 设置回调
     * @param onSucceed 
     * @param onFail 
     */
    public setCallback(onSucceed: (data: any) => void, onFail: (message: string) => void): void {
        if (!onSucceed || !onFail) {
            throw new Error("onSucceed or onFail is not set");
        }
        this._onSucceed = onSucceed;
        this._onFail = onFail;
    }

    /**
     * 完成事件(HttpTask方法)
     * @param response 
     */
    public override onCompete(response: IHttpResponse): void {
        try {
            this.onTaskCompete(response.data);
            this._onSucceed?.(response.data);
        } catch (e) {
            debug(`NetTaskBase onCompete error,name:${this.name}`, e);
            this.onTaskError?.(response.status, response.message);
        }
    }

    /**
     * 错误事件(HttpTask方法)
     * @param response 
     */
    public override onError(response: IHttpResponse): void {
        debug(`NetTaskBase onError\n   name:${this.name}\n   url:${this.url}\n   message:${response.message}\n   statusCode:${response.status}`);
        this.onHttpError?.(response.message);
        this._onFail?.(response.message ?? "");
    }

    /**
     * 任务完成(子类必须实现)
     * @param data 数据
     */
    protected abstract onTaskCompete(data: any): void;

    /**
     * 任务错误(子类选择实现)
     * @param errorCode 
     * @param message 
     */
    protected onTaskError(errorCode: number, message: string): void { }
    /**
     * 错误事件(子类选择实现)
     * @param message 
     */
    protected onHttpError(message: string): void { }
}