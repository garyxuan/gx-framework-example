/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-01 16:13:28
 * @Description: http请求
 */
import { sys } from "cc";
import { HttpRequestMethod, HttpResponseDataType, HttpResponseType, IHttpRequest, IHttpResponse, THttpCallback, THttpResult } from "./header";
import { warn } from "../../tool/Log";

export class HttpRequest implements IHttpRequest, IHttpResponse {
    public method: HttpRequestMethod;
    public timeout: number;
    public responseType: HttpResponseType;

    public message: string;
    public data: HttpResponseDataType;

    private _xhr: XMLHttpRequest = null;
    private _callback: THttpCallback = null;

    public get status() {
        return this._xhr?.status;
    }

    public get headers() {
        return this._xhr?.getAllResponseHeaders();
    }

    constructor() {
        this._xhr = new XMLHttpRequest();
    }

    public setCallback(callback: THttpCallback) {
        this._callback = callback;
    }

    public send(url: string, data?: any, headers?: any[]): void {
        let xhr = this._xhr;
        xhr.timeout = this.timeout * 1000;
        xhr.responseType = this.responseType;
        xhr.onabort = this._onAbort.bind(this);
        xhr.onerror = this._onError.bind(this);
        xhr.onload = this._onLoad.bind(this);
        xhr.ontimeout = this._onTimeout.bind(this);
        xhr.open(this.method, encodeURI(url));
        if (headers) {
            for (let i = 0; i < headers.length; i += 2) {
                xhr.setRequestHeader(headers[i], headers[i + 1]);
            }
        }
        else if (!sys.isMobile && sys.isBrowser) {
            if (!data || typeof data == "string") {
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            } else {
                xhr.setRequestHeader("Content-Type", "application/json");
            }
        }
        if (sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.send(data);
    }

    public abort(silent: boolean): void {
        if (silent) {
            this._clear();
        }
        this._xhr.abort();
    }

    private _onAbort(): void {
        this.message = "request aborted by user";
        this.handlerError();
    }

    private _onError(): void {
        this.message = "request error";
        this.handlerError();
    }

    private _onLoad(): void {
        let xhr = this._xhr;
        let status = xhr.status !== undefined ? xhr.status : 200;
        if (status == 200 || status == 204 || status == 0) {
            this.onCompete();
        }
        else {
            this.message = "status:" + xhr.status + " statusText:" + xhr.statusText + " responseURL:" + xhr.responseURL;
            this.handlerError();
        }
    }

    private _onTimeout(): void {
        this.message = "request timeout";
        this.handlerError();
    }

    private handlerError() {
        this._callback?.(THttpResult.Fail, this);
        this._clear();
    }

    private onCompete() {
        try {
            if (this.responseType == "json") {
                this.data = this._xhr.response;
            }
            else if (this.responseType == "arraybuffer") {
                this.data = this._xhr.response;
            }
            else {
                this.data = this._xhr.responseText;
            }
            this._callback?.(THttpResult.Succeed, this);
            this._clear();
        } catch (e) {
            warn(`http响应数据解析错误，HttpResponseType(${this.responseType})\n    url: ${this._xhr.responseURL}\n    error: ` + e)
            this.handlerError();
        }
    }

    private _clear() {
        this._xhr.onabort = null;
        this._xhr.onerror = null;
        this._xhr.onload = null;
        this._xhr.ontimeout = null;
        this._callback = null;
    }


}