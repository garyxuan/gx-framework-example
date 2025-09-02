// 协议类型枚举
export enum ProtocolType {
    String,     // 字符串协议
    Protobuf,   // Protobuffer协议
    // Binary,     // 二进制协议
    // Json        // JSON协议
}

// 回调对象
export interface ICallBackObject {
    target: any,            //回调目标，不为null时调用target.callback(xxx)
    callback: (cmd: number, data: any) => void,//回调函数
}

// 请求对象
export interface IRequestObject {
    buffer: string | ArrayBuffer,   // 请求的Buffer
    respCmd: number,    // 等待响应指令
    respCmdName: string,
    respObject: ICallBackObject | null;// 等待响应的回调对象
}

// 协议处理器接口，提供打包和解包功能
export interface IProtocolHandler {
    /** 打包*/
    pack(cmd: number, cmdName: string, data: any, reqId: number): any;
    /** 解包 */
    unpack(cmdName: string, data: any): any;
    /** 解包基础消息 */
    unpackBase(data: any): any;
    /** 设置心跳包 */
    setHeartBeat(cmd: number, cmdName: string, data: any): void;
    /** 获取心跳包 */
    getHeartBeatCmd(): number;
    getHeartBeatCmdName(): string;
    getHeartBeatData(): any;
    /** 获取协议类型 */
    getProtocolType(): ProtocolType;
}

export class DefaultStringProtocol implements IProtocolHandler {
    pack(cmd: number, cmdName: string, data: string, reqId: number) {
        return data;
    }
    unpack(cmdName: string, data: string): string {
        return data;
    }
    unpackBase(data: string): string {
        return data;
    }
    setHeartBeat(cmd: number, cmdName: string, data: any): void {

    }
    getHeartBeatCmd(): number {
        return 1;
    }
    getHeartBeatCmdName(): string {
        return "Ping"
    }
    getHeartBeatData(): any {
        return JSON.stringify({ data: "ping" });
    }

    getProtocolType(): ProtocolType {
        return ProtocolType.String;
    }

}

// 协议辅助接口
export interface IProtocolHelper {
    getHeadLen(): number;               // 返回包头长度
    getHeartBeat(): string | ArrayBuffer;             //返回一个心跳包
    getPackageLen(msg: string | ArrayBuffer): number;//返回整个包的长度
    checkPackage(msg: string | ArrayBuffer): boolean; //检查包数据是否合法
    getPackageId(msg: string | ArrayBuffer): number;// 返回包的id或协议类型
}

// 网络提示接口
export interface INetworkTips {
    connectTips(isShow: boolean): void;
    reconnectTips(isShow: boolean): void;
    requestTips(isShow: boolean): void;
}

export interface ISocketEvent {
    onConnected(): void;//连上了
    onError?(): void;//网络不通
    onClose?(code: number): void;//网络不通或者服务器主动断开
    onReconnecting?(): void;//重连中
    onReconnected?(): void;//重连成功
}
