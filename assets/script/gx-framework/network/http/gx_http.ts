import { sys } from "cc";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-19 14:23:11
 * @Description: HTTP类
 */
export namespace _gx_http {
    export class config {
        constructor(init?: Partial<config>) {
            Object.assign(this, init);
        }

        // 超时时间(ms)
        timeout: number = 5000;
        // 返回类型
        responseType?: XMLHttpRequestResponseType;
        // 请求体
        body?: Document | Blob | BufferSource | FormData | URLSearchParams | string;
        // 请求头
        header?: Record<string, string>;
        // open回调
        onOpen?: (http: XMLHttpRequest) => void;
        // 错误回调
        onError?: (http: XMLHttpRequest) => void;
        // 超时回调
        onTimeout?: (http: XMLHttpRequest) => void;
    }
}

class HTTP {

    get(url: string, config_: Partial<_gx_http.config>): Promise<any> {
        return this._open("GET", url, config_);
    }

    post(url: string, config_: Partial<_gx_http.config>): Promise<any> {
        return this._open("POST", url, config_);
    }

    private async _open(type: "GET" | "POST", url: string, config_?: Partial<_gx_http.config>): Promise<any> {
        const xmlHttp = new XMLHttpRequest();
        let config = new _gx_http.config(config_);
        xmlHttp.timeout = config.timeout;
        if (config.responseType) {
            xmlHttp.responseType = config.responseType;
        }

        return new Promise<any>((resolve, reject) => {
            //超时
            const timeoutTimer = setTimeout(() => {
                reject(null);
            }, config.timeout);

            // ready
            xmlHttp.onreadystatechange = async () => {
                if (xmlHttp.readyState == 4 && xmlHttp.status >= 200 && xmlHttp.status < 400) {
                    let result: any = null;
                    switch (xmlHttp.responseType) {
                        case "":
                        case "text":
                            result = xmlHttp.response;
                            break;
                        // response 是一个包含二进制数据的 JavaScript ArrayBuffer
                        case "arraybuffer":
                            {
                                const buf = new Uint8Array(xmlHttp.response);
                                let data = "";
                                for (let i = 0; i < buf.length; i++) {
                                    data += String.fromCharCode(buf[i]);
                                }
                                result = "data:image/png;base64," + window.btoa(data);
                                break;
                            }
                        case "blob":
                            {
                                result = await new Promise<any>((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        resolve(reader.result);
                                    }
                                    reader.onerror = () => {
                                        reject(new Error("Failed to read blob"));
                                    }
                                    reader.readAsDataURL(xmlHttp.response);
                                })
                                break;
                            }
                        case "document":
                            {
                                result = xmlHttp.response;
                                break;
                            }
                        case "json":
                            {
                                result = xmlHttp.response;
                                break;
                            }
                    }
                    clearTimeout(timeoutTimer);
                    resolve(result);
                }
            }
            xmlHttp.onerror = () => {
                clearTimeout(timeoutTimer);
                config.onError && config.onError(xmlHttp);
                reject(null);
            }

            xmlHttp.ontimeout = () => {
                clearTimeout(timeoutTimer);
                config.onTimeout && config.onTimeout(xmlHttp);
                reject(null);
            }


            xmlHttp.open(type, url, true);

            // 设置header
            {
                if (sys.isNative) {
                    xmlHttp.setRequestHeader("Accept-Encoding", "gzip,deflate");
                }
                if (config.header) {
                    for (const key in config.header) {
                        xmlHttp.setRequestHeader(key, config.header[key]);
                    }
                }
            }

            // open回调
            config.onOpen && config.onOpen(xmlHttp);

            xmlHttp.send(config.body);
        })
    }
}
