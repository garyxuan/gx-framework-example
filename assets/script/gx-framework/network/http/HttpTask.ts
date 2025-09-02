
/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-01 16:13:28
 * @Description: http任务
 */

import { IHttpEvent, IHttpResponse } from "./header";

export abstract class HttpTask implements IHttpEvent {
    /** 事件名称 */
    public name: string;
    /** 事件数据 */
    public data: any;
    /** 完成事件 */
    public abstract onCompete(response: IHttpResponse): void;
    /** 错误事件 */
    public abstract onError(response: IHttpResponse): void;
    /** 开始任务 */
    public abstract start(): void;
}