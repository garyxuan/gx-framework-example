/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-01 15:44:05
 * @Description: http头文件
 */
/** http响应数据类型 */
export type HttpResponseDataType = string | ArrayBuffer | object;
/** http响应类型 */
export type HttpResponseType = "text" | "json" | "arraybuffer";
/** http请求方法 */
export type HttpRequestMethod = "GET" | "POST" | "HEAD" | "PUT"
export enum THttpResult {
    Succeed = "succeed",
    Fail = "fail",
}
/** http回调 */
export type THttpCallback = (result: THttpResult, response: IHttpResponse) => void;

/** http响应 */
export interface IHttpResponse {
    readonly message: string;
    readonly data: HttpResponseDataType;
    readonly status: number;
    readonly headers: any;
}

/** http请求 */
export interface IHttpRequest {
    readonly method: HttpRequestMethod;
    readonly timeout: number;
    readonly responseType: HttpResponseType;
}

/** http事件 */
export interface IHttpEvent {
    /** 事件名称 */
    name?: string;
    /** 事件数据 */
    data?: any;
    /** 打开事件 */
    onOpen?(): void;
    /** 完成事件 */
    onCompete(response: IHttpResponse): void;
    /** 错误事件 */
    onError(response: IHttpResponse): void;
}

