/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-01 16:13:28
 * @Description: http管理器
 */
import { HttpRequestMethod, HttpResponseType, IHttpEvent, IHttpResponse, THttpResult } from "./header";
import { HttpRequest } from "./HttpRequest";

export class HttpManager {
    /**
     * post请求
     * @param url 请求地址
     * @param data 请求数据
     * @param responseType 响应类型
     * @param httpEvent 事件
     * @param headers 请求头 请求头 [key1, value1, key2, value2, ...] 形式
     * @param timeout 请求超时时间(秒)
     * @returns 请求对象
     */
    public static post(url: string, data: any, responseType: HttpResponseType = "json", httpEvent: IHttpEvent, headers?: any[], timeout: number = 10): HttpRequest {
        return this._send("POST", url, data, responseType, httpEvent, headers, timeout);
    }

    /**
     * get请求
     * @param url 请求地址
     * @param data 请求数据
     * @param responseType 响应类型
     * @param httpEvent 事件
     * @param headers 请求头 请求头 [key1, value1, key2, value2, ...] 形式
     * @param timeout 请求超时时间(秒)
     * @returns 请求对象
     */
    public static get(url: string, data: any, responseType: HttpResponseType = "json", httpEvent: IHttpEvent, headers?: any[], timeout: number = 10): HttpRequest {
        return this._send("GET", url, data, responseType, httpEvent, headers, timeout);
    }

    /**
     * put请求
     * @param url 请求地址
     * @param data 请求数据
     * @param responseType 
     * @param httpEvent 事件
     * @param headers 请求头 请求头 [key1, value1, key2, value2, ...] 形式
     * @param timeout 请求超时时间(秒)
     * @returns 请求对象
     */
    public static put(url: string, data: any, responseType: HttpResponseType = "json", httpEvent: IHttpEvent, headers?: any[], timeout: number = 10): HttpRequest {
        return this._send("PUT", url, data, responseType, httpEvent, headers, timeout);
    }

    /**
     * head请求
     * @param url 请求地址
     * @param data 请求数据
     * @param responseType 
     * @param httpEvent 事件
     * @param headers 请求头 请求头 [key1, value1, key2, value2, ...] 形式
     * @param timeout 请求超时时间(秒)
     * @returns 请求对象
     */
    public static head(url: string, data: any, responseType: HttpResponseType = "json", httpEvent: IHttpEvent, headers?: any[], timeout: number = 10): HttpRequest {
        return this._send("HEAD", url, data, responseType, httpEvent, headers, timeout);
    }

    /**
     * 发送请求
     * @param method 请求方法
     * @param url 请求地址
     * @param data 请求数据
     * @param responseType 响应类型
     * @param httpEvent 事件
     * @param headers 请求头 请求头 [key1, value1, key2, value2, ...] 形式
     * @param timeout 请求超时时间(秒)
     * @returns 
     */
    private static _send(method: HttpRequestMethod, url: string, data: any, responseType: HttpResponseType = "json", httpEvent: IHttpEvent, headers?: any[], timeout?: number): HttpRequest {
        let http = new HttpRequest();
        http.setCallback((result: THttpResult, response: IHttpResponse) => {
            switch (result) {
                case THttpResult.Succeed:
                    httpEvent?.onCompete?.(response);
                    break;
                case THttpResult.Fail:
                    httpEvent?.onError?.(response);
                    break;
            }
        })
        http.method = method;
        http.timeout = timeout;
        http.responseType = responseType;
        httpEvent?.onOpen?.();
        http.send(url, data, headers);
        return http;
    }

}