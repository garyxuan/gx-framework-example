/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 17:54:00
 * @Description:
 */
// import { SocketNode } from "./SocketNode";

// /*
//  * @Author: garyxuan
//  * @Version: V1.0
//  * @Date: 2025-08-19 11:20:33
//  * @Description:   网络节点管理类 管理所有网络节点
//  */
// export class gx_network_manager {
//     private static _instance: gx_network_manager = null;
//     public static get instance(): gx_network_manager {
//         if (this._instance == null) {
//             this._instance = new gx_network_manager();
//         }
//         return this._instance;
//     }

//     protected _channels: { [key: number]: SocketNode } = {};

//     public setNetNode(netNode: SocketNode, channel: number = 0) {
//         this._channels[channel] = netNode;
//         return channel;
//     }

//     public removeNetNode(channel: number) {
//         delete this._channels[channel];
//     }

//     public getNetNode(channel: number) {
//         return this._channels[channel];
//     }

//     public connect(options: INetConnectOptions, channel: number = 0) {
//         if (this._channels[channel]) {
//             return this._channels[channel].connect(options);
//         }
//         return false;
//     }

//     public send(data: gx_network_base.TNetData, force: boolean = false, channel: number = 0) {
//         if (this._channels[channel]) {
//             return this._channels[channel]!.send(data, force);
//         }
//         return -1;
//     }

//     public request(data: gx_network_base.TNetData, respCmd: number, respObject: gx_network_base.ICallBackObject, showTips: boolean = true, force: boolean = false, channel: number = 0) {
//         if (this._channels[channel]) {
//             this._channels[channel]!.request(data, respCmd, respObject, showTips, force);
//         }
//     }

//     public requestUnique(data: gx_network_base.TNetData, respCmd: number, respObject: gx_network_base.ICallBackObject, showTips: boolean = true, force: boolean = false, channel: number = 0) {
//         if (this._channels[channel]) {
//             this._channels[channel]!.requestUnique(data, respCmd, respObject, showTips, force);
//         }
//     }

//     public close(code?: number, reason?: string, channel: number = 0) {
//         if (this._channels[channel]) {
//             this._channels[channel]!.closeSocket(code, reason);
//         }
//     }
// }
