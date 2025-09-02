/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-18 15:17:35
 * @Description: 网络节点基类，以及网络相关接口定义
 * 1. 网络连接、断开、请求发送、数据接收等基础功能
 * 2. 心跳机制
 * 3. 断线重连 + 请求重发
 * 4. 调用网络屏蔽层
 */
import { debug, error, warn } from "../../tool/Log";
import { ICallBackObject, INetworkTips, IProtocolHandler, IRequestObject, ISocketEvent } from "./header";
import { WebSock } from "./WebSock";

/** 连接选项 */
type ConnectOptions = {
    protocols?: string[],//协议
    timeout?: number,//超时时间
    binaryType?: BinaryType,
    autoReconnect?: number//-1 永久重连，0不自动重连，其他正整数为自动重试次数
}

// 网络节点状态
enum SocketNodeState {
    Closed,//已关闭
    Connecting,//连接中
    Working,//工作状态,可传输数据
}

// 网络提示类型
enum SocketTipsType {
    Connecting,//连接中
    ReConnecting,//重连中
    Requesting,//请求中
}

export class SocketNode {
    protected _socket: WebSock | null = null;// Socket对象
    protected _state: SocketNodeState = SocketNodeState.Closed;
    protected _isSocketInit: boolean = false;// Socket是否初始化
    protected _isSocketOpen: boolean = false;// Socket是否打开
    protected _url: string;// 连接地址
    protected _connectOptions: ConnectOptions | null = null;// 连接选项
    protected _connectCallback: ISocketEvent | null = null;// 连接回调
    protected _binaryType: BinaryType;                      // 二进制类型
    protected _autoReconnect: number = 0;                   // 自动重连次数
    protected _isAutoReconnect: boolean = false;           // 是否自动重连

    protected _protocolHandler: IProtocolHandler | null = null;// 协议处理器
    protected _networkTips: INetworkTips | null = null;// 网络提示ui对象

    protected _reqId: number = 0;                                           // 请求id
    protected _keepAliveTimer: any = null;                                  // 心跳定时器
    protected _receiveMsgTimer: any = null;                                 // 接收数据定时器
    protected _reconnectTimer: any = null;                                  // 重连定时器
    protected _heartTime: number = 3000;                                   // 心跳间隔
    protected _receiveTime: number = 6000000;                               // 多久没收到数据断开
    protected _reconnectTimeout: number = 3000;                             // 重连间隔

    protected _requests: IRequestObject[] = new Array<IRequestObject>();//请求列表
    protected _requestListeners: Map<number, Array<ICallBackObject>> = new Map<number, Array<ICallBackObject>>();//请求监听者列表
    protected _cmdMap: Map<number, string> = new Map<number, string>();//命令号与命令名称的映射

    /**
     * 初始化socket
     * @param socket Socket对象
     * @param protocolHandler 协议处理器
     * @param networkTips 网络提示ui对象
     */
    public init(socket: WebSock, protocolHandler: IProtocolHandler, networkTips: INetworkTips = null) {
        debug("SocketNode:init socket!");
        this._socket = socket;
        this._protocolHandler = protocolHandler;
        this._networkTips = networkTips;
    }

    /**
     * 连接
     * @param url 连接地址
     * @param options 连接选项
     * @param bReconnect 是否重连
     */
    public connect(url: string, options: ConnectOptions, callback?: ISocketEvent): boolean {
        if (this._socket && this._state == SocketNodeState.Closed) {
            if (!this._isSocketInit) {
                this.initSocket();
            }
            this._state = SocketNodeState.Connecting;
            if (!this._socket.connect(url, options.binaryType, options.timeout, options.protocols)) {
                this.updateNetTips(SocketTipsType.Connecting, false);
                return false;
            }
            if (this._connectOptions == null && typeof options.autoReconnect == "number") {
                this._autoReconnect = options.autoReconnect;
            }
            this._connectOptions = options;
            this._url = url;
            this._connectCallback = callback ?? this._connectCallback;
            this.updateNetTips(SocketTipsType.Connecting, true)
            return true;
        }
        return false;
    }

    /**
     * 初始化socket
     */
    protected initSocket() {
        if (this._socket) {
            this._socket.onopen = this.onConnected.bind(this);
            this._socket.onmessage = this.onMessage.bind(this);
            this._socket.onerror = this.onError.bind(this);
            this._socket.onclose = this.onClosed.bind(this);
            this._isSocketInit = true;
        }
    }

    /**
     * 更新网络提示
     * @param tipsType 提示类型
     * @param isShow 是否显示
     */
    protected updateNetTips(tipsType: SocketTipsType, isShow: boolean) {
        if (this._networkTips) {
            switch (tipsType) {
                case SocketTipsType.Connecting:
                    this._networkTips.connectTips(isShow);
                    break;
                case SocketTipsType.ReConnecting:
                    this._networkTips.reconnectTips(isShow);
                    break;
                case SocketTipsType.Requesting:
                    this._networkTips.requestTips(isShow);
                    break;
            }
        }
    }

    /**
     * 连接成功
     */
    protected onConnected(event: any) {
        debug("SocketNode:onConnected！")
        if (this._isAutoReconnect) {
            this._connectCallback?.onReconnected();
        }
        else {
            this._connectCallback?.onConnected?.();
        }
        this._isSocketOpen = true;
        this._isAutoReconnect = false;
        this._state = SocketNodeState.Working;

        // 重置定时器
        this.resetHeartBeatTimer();
        this.resetReceiveMsgTimer();

        // 关闭连接或重连中的状态显示
        this.updateNetTips(SocketTipsType.Connecting, false);
        this.updateNetTips(SocketTipsType.ReConnecting, false);

        // 处理待发送消息
        if (this._requests.length > 0) {
            // 从后往前遍历，避免索引问题
            for (let i = this._requests.length - 1; i >= 0; i--) {
                let req = this._requests[i];
                if (!req) continue;

                let postData = this._protocolHandler.pack(req.respCmd, req.respCmdName + "Req", req.buffer, ++this._reqId);
                if (postData) {
                    this._socket!.sendBuffer(postData);
                }

                if (req.respObject == null || req.respCmd <= 0) {
                    this._requests.splice(i, 1);
                }
            }
            // 如果还有等待返回的请求，启动网络请求层
            this.updateNetTips(SocketTipsType.Requesting, this._requests.length > 0);
        }

        debug("SocketNode:onConnected! state = " + this._state);
    }

    /**
     * 收到消息
     * @param msg 消息
     */
    protected onMessage(msg: any): void {
        try {
            msg = this._protocolHandler.unpackBase(msg);
            if (!msg) {
                error("SocketNode:onMessage unpackBase error!")
                return
            }
            let cmd: number = msg.cmd;
            let cmdName = this._cmdMap.get(cmd);
            if (!cmdName) {
                error("SocketNode:onMessage cmdName error! cmd = " + cmd, msg)
                return
            }
            let data = this._protocolHandler.unpack(cmdName, msg.data);
            if (!data) {
                error("SocketNode:onMessage unpack error! cmd = " + cmd + " cmdName = " + cmdName)
                return
            }
            // 重置定时器
            this.resetReceiveMsgTimer();
            this.resetHeartBeatTimer();

            // 处理心跳
            if (cmd == this._protocolHandler.getHeartBeatCmd()) {
                debug("SocketNode:HeartBeat resp")
                return
            }
            debug("SocketNode:onMessage respCmd=", cmd)

            // 处理请求响应
            this.handleRequestResponse(cmd, data);

            // 处理监听者
            this.handleListeners(cmd, data);
        }
        catch (e) {
            error("SocketNode:onMessage error!", e)
        }
    }

    /**
     * 处理请求响应
     */
    private handleRequestResponse(cmd: number, data: any): void {
        if (this._requests.length === 0) return;

        for (let i = this._requests.length - 1; i >= 0; i--) {
            let req = this._requests[i];
            if (req.respCmd == cmd && req.respObject) {
                debug(`SocketNode execute request respCmd ${cmd}`);
                try {
                    req.respObject.callback.call(req.respObject.target, req.respCmd, data);
                } catch (e) {
                    error(`SocketNode execute fail cmd:${cmd}:`, e);
                }
                this._requests.splice(i, 1);
                break;
            }
        }

        debug(`SocketNode still has ${this._requests.length} request waiting`);
        this.updateNetTips(SocketTipsType.Requesting, this._requests.length > 0);
    }

    /**
     * 处理监听者
     */
    private handleListeners(cmd: number, data: any): void {
        let listeners = this._requestListeners.get(cmd);
        if (!listeners || listeners.length === 0) return;

        listeners.forEach(callObject => {
            try {
                callObject.callback.call(callObject.target, cmd, data);
            } catch (e) {
                error(`SocketNode execute listener fail cmd:${cmd}:`, e);
            }
        });
    }

    /**
     * 错误处理
     * @param event 
     */
    protected onError(event: any) {
        debug("SocketNode onError", event)
        this._connectCallback?.onError?.();
        this._isAutoReconnect = false;
    }

    /**
     * 连接关闭
     * @param event 关闭事件
     */
    protected onClosed(event: any) {
        debug("SocketNode onClosed", event)
        this._connectCallback?.onClose?.(event?.code);
        this._isAutoReconnect = false;
        this.clearTimer();
        // 自动重连
        if (this._autoReconnect != 0) {
            this.updateNetTips(SocketTipsType.ReConnecting, true);
            this._reconnectTimer = setTimeout(() => {
                if (this._socket) {
                    this._socket.close();
                }
                this._state = SocketNodeState.Closed;
                this._connectCallback?.onReconnecting?.();
                this.connect(this._url, this._connectOptions);
                this._isAutoReconnect = true;
                if (this._autoReconnect > 0) {
                    this._autoReconnect--;
                    if (this._autoReconnect == 0) {
                        warn("auto reconnect end!");
                    }
                }
            }, this._reconnectTimeout);
        }
        else {
            this._state = SocketNodeState.Closed;
        }
    }

    /**
     * 关闭网络节点
     * @param code 关闭码
     * @param reason 关闭原因
     */
    public close(code?: number, reason?: string) {
        this.clearTimer();
        this._requestListeners.clear();
        if (this._networkTips) {
            this._networkTips.connectTips(false);
            this._networkTips.reconnectTips(false);
            this._networkTips.requestTips(false);
        }
        if (this._socket) {
            this._socket.close(code, reason);
        }
        else {
            this._state = SocketNodeState.Closed;
        }
    }

    /**
     * 仅关闭socket(不关闭网络节点,复用缓存和当前状态)
     * @param code 关闭码
     * @param reason 关闭原因
     */
    public closeSocket(code?: number, reason?: string) {
        if (this._socket) {
            this._socket.close(code, reason);
        }
    }

    /**
     * 发送数据
     * @param data 数据
     * @param force 是否强制发送，强制发送不会进入缓存队列，直接发送
     * @returns 发送结果
     */
    public send(cmd: number, cmdName: string, data: any, force: boolean = false): number {
        if (!this._socket) {
            error("SocketNode socket is not initialized!")
            return -1;
        }
        if (this._state == SocketNodeState.Working || force) {
            debug("SocketNode socket send ...");
            let postData = this._protocolHandler.pack(cmd, cmdName + "Req", data, ++this._reqId);
            if (!postData) {
                error("SocketNode pack error! cmd = " + cmd + " cmdName = " + cmdName + " data = " + data)
                return -1;
            }
            this._cmdMap.set(cmd, cmdName + "Resp");
            return this._socket!.sendBuffer(postData);
        }
        else if (this._state == SocketNodeState.Connecting) {
            this._requests.push(
                {
                    buffer: data,
                    respCmd: cmd,
                    respCmdName: cmdName,
                    respObject: null
                }
            )
            this._cmdMap.set(cmd, cmdName + "Resp");
            debug("SocketNode socket is busy, push to send buffer, current state is " + this._state);
            return 0;
        }
        else {
            error("SocketNode request error! current state is " + this._state);
            return -1;
        }
    }

    /**
     * 发送请求
     * @param data 请求数据
     * @param cmd 响应协议号
     * @param respObject 响应回调对象
     * @param showTips 是否显示提示
     * @param force 是否强制发送，强制发送不会进入缓存队列，直接发送
     */
    public request(cmd: number, cmdName: string, data: any, respObject: ICallBackObject, showTips: boolean = true, force: boolean = false) {
        if (this._state == SocketNodeState.Working || force) {
            let postData = this._protocolHandler.pack(cmd, cmdName + "Req", data, ++this._reqId);
            this._socket!.sendBuffer(postData);
        }
        debug(`SocketNode request cmd ${cmd} showTips ${showTips} force ${force}`)
        //进入发送缓存队列
        this._requests.push({
            buffer: data,
            respCmd: cmd,
            respCmdName: cmdName,
            respObject: respObject
        })
        this._cmdMap.set(cmd, cmdName + "Resp");
        // 启动网络请求层
        if (showTips) {
            this.updateNetTips(SocketTipsType.Requesting, true);
        }
    }

    /**
     * 唯一request，确保没有同一响应的请求（避免一个请求重复发送，netTips界面的屏蔽也是一个好的方法）
     * @param data 请求数据
     * @param respCmd 响应协议号
     * @param respObject 响应回调对象
     * @param showTips 是否显示提示
     * @param force 是否强制发送
     * @returns 是否发送成功
     */
    requestUnique(cmd: number, cmdName: string, data: any, respObject: ICallBackObject, showTips: boolean = true, force: boolean = false) {
        for (let i = 0; i < this._requests.length; i++) {
            let req = this._requests[i];
            if (req.respCmd == cmd) {
                debug(`SocketNode requestUnique cmd ${cmd} already exists`)
                return false;
            }
        }
        this.request(cmd, cmdName, data, respObject, showTips, force);
        return true;
    }

    /**
     * 设置响应处理,同一个target会被覆盖
     * @param cmd 协议号
     * @param callback 回调函数
     * @param target 回调目标
     */
    public setResponseHandler(cmd: number, cmdName: string, callback: (cmd: number, data: any) => void, target?: any) {
        if (callback == null) {
            error("SocketNode:setResponseHandler callback is null")
            return;
        }
        this._cmdMap.set(cmd, cmdName);
        let arr = this._requestListeners.get(cmd);
        if (arr == undefined) {
            this._requestListeners.set(cmd, new Array<ICallBackObject>());
        }
        if (arr && arr.length > 0) {
            let listener = arr.find(x => x.target == target);
            if (listener) {
                listener.target = target;
                listener.callback = callback;
                return;
            }
        }
        this._requestListeners.get(cmd).push({ target, callback });
    }

    /**
     * 移除响应处理
     * @param cmd 协议号
     * @param callback 回调函数
     * @param target 回调目标
     */
    public removeResponseHandler(cmd: number, target?: any) {
        if (!this._requestListeners.has(cmd)) return;
        let arr = this._requestListeners.get(cmd);
        arr = arr.filter(x => x.target != target);
        this._requestListeners.set(cmd, arr);
    }

    /**
     * 清除请求监听者
     * @param cmd 协议号，-1表示清除所有
     */
    public removeRequestListeners(cmd: number = -1) {
        if (cmd == -1) {
            this._requestListeners.forEach(listeners => {
                listeners.length = 0;
            })
            this._requestListeners.clear();
        }
        else {
            if (this._requestListeners.has(cmd)) {
                this._requestListeners.get(cmd).length = 0;
            }
        }
    }

    protected clearTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }
        if (this._reconnectTimer !== null) {
            clearTimeout(this._reconnectTimer);
        }
    }

    protected resetReceiveMsgTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }
        this._receiveMsgTimer = setTimeout(() => {
            warn("SocketNode:receiveMsgTimer close socket!")
            this._socket!.close();
        }, this._receiveTime);
    }

    protected resetHeartBeatTimer() {
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }
        this._keepAliveTimer = setTimeout(() => {
            debug("SocketNode keepAliveTimer send HeartBeat!")
            this.send(this._protocolHandler.getHeartBeatCmd(), this._protocolHandler.getHeartBeatCmdName(), this._protocolHandler.getHeartBeatData(), true);
        }, this._heartTime);
    }
}
