import { error, warn } from "../../tool/Log";

// WebSocket封装
export class WebSock {
    private _ws: WebSocket | null = null;
    onopen: (() => void) | null = null;
    onmessage: ((data: any) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;

    /**
     * 连接
     * @param options 连接选项
     * @returns 是否连接成功
     */
    connect(url: string, binaryType?: BinaryType, timeout?: number, protocols?: string | string[]): boolean {
        if (this._ws) {
            if (this._ws.readyState === WebSocket.CONNECTING) {//连接正在进行关闭握手，或者该close()方法已被调用。
                warn("WebSocket connecting, wait for a while...");
                return false;
            }
            this.close();
        }
        try {
            this._ws = new WebSocket(url, protocols);
            if (binaryType) {
                this._ws.binaryType = binaryType;
            }

            let timer = null;
            if (timeout) {
                timer = setTimeout(() => {
                    this._ws && this._ws.close();
                    this._ws = null;
                }, timeout);
            }

            // 连接成功后调用
            this._ws.onopen = () => {
                timer && clearTimeout(timer);
                timer = null;
                this.onopen?.();
            };
            // 有消息过来时调用：传入的对象有data属性，可能是字符串、blob或arraybuffer。
            this._ws.onmessage = (event: MessageEvent) => {
                this.onmessage?.(event.data);
            }
            // 出现网络错误时调用：传入的对象有data属性，通常是错误描述的字符串。
            this._ws.onerror = (event: Event) => {
                timer && clearTimeout(timer);
                timer = null;
                this.onerror?.(event);
            };
            // 连接关闭时调用：传入的对象有code、reason、wasClean等属性。
            this._ws.onclose = (event: CloseEvent) => {
                timer && clearTimeout(timer);
                timer = null;
                this.onclose?.(event);
            };
            // 注意：当网络出错时，会先调用onerror再调用onclose，无论何种原因的连接关闭，onclose都会被调用。
            return true;
        } catch (e) {
            error("WebSocket connect error! url = " + url, e)
            return false;
        }
    }

    /**
     * 发送字符串数据
     * @param data 
     * @returns 
     */
    send(data: string): number {
        if (this._ws && this._ws.readyState === WebSocket.OPEN) {//连接已建立，可以进行通信。
            this._ws.send(data);
            return 1;
        }
        return -1;
    }

    /**
     * 发送二进制数据
     * @param data 
     * @returns 
     */
    sendBuffer(data: ArrayBuffer): number {
        if (this._ws && this._ws.readyState === WebSocket.OPEN) {//连接已建立，可以进行通信。
            this._ws.send(data);
            return 1;
        }
        return -1;
    }

    /**
     * 关闭连接
     * @param code 
     * @param reason 
     */
    close(code?: number, reason?: string): void {
        if (this._ws) {
            this._ws.onclose = null;
            this._ws.onerror = null;
            this._ws.onmessage = null;
            this._ws.onopen = null;
            this._ws.close(code, reason);
            this._ws = null;
        }
    }
}