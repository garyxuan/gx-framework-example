import { debug, error, warn } from "../../tool/Log";
import { IProtocolHandler, ProtocolType } from "./header";
import ProtoBuf from 'protobufjs'


/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-25 17:44:23
 * @Description: protoBuffer协议处理器
 */

export class ProtobufferHandler implements IProtocolHandler {
    /**
     * 解析后的proto文件
     */
    private _builder: any = null;
    private _heartBeatCmd: number = 0;
    private _heartBeatCmdName: string = "";
    private _heartBeatData: any = null;

    /**
     * 添加proto文件内容
     * @param protos 
     */
    addProto(protos: any) {
        try {
            let builder = ProtoBuf.parse(protos).root;
            this._builder = builder;
            return true;
        } catch (e) {
            error("ProtobufferHandler:addProto error!", e)
            return false;
        }

    }
    /**
     * 打包消息
     * @param cmd 命令
     * @param cmdName 命令名称
     * @param data 数据
     * @param reqId 请求id
     * @returns 
     */
    pack(cmd: number, cmdName: string, data: any, reqId: number): any {
        try {
            let msg = this._builder.lookupType(cmdName);
            if (!msg) {
                debug(`ProtobufferHandler:pack cannot find cmdName = ${cmdName}`)
                return null;
            }
            let info = msg.encode(data).finish();
            let base = this._builder.lookupType("BaseCmd");
            let baseInfo = base.encode({ cmd, data: info, reqId }).finish();
            return baseInfo;
        } catch (e) {
            error(`ProtobufferHandler:pack error! cmd = ${cmd} cmdName = ${cmdName}`, e)
            return null;
        }
    }
    /**
     * 解包消息
     * @param cmdName 命令名称
     * @param data 数据
     * @returns 
     */
    unpack(cmdName: string, data: any): any {
        try {
            let msg = this._builder.lookupType(cmdName);
            if (!msg) {
                warn(`ProtobufferHandler:unpack cannot find cmdName = ${cmdName}`)
                return null;
            }
            return msg.decode(data);
        } catch (e) {
            warn(`ProtobufferHandler:unpack error! cmdName = ${cmdName}`, e)
            return null;
        }
    }

    /**
     * 解包基础消息
     * @param data 数据
     * @returns 
     */
    unpackBase(data: any): any {
        try {
            let base = this._builder.lookupType("BaseCmd");
            if (!base) {
                error(`ProtobufferHandler:unpackBase cannot find BaseCmd`)
                return null;
            }
            return base.decode(new Uint8Array(data))
        } catch (e) {
            error(`ProtobufferHandler:unpackBase error!`, e)
            return null;
        }
    }

    /**
     * 设置心跳包
     * @param cmd 设置心跳包
     * @param cmdName 设置心跳名称
     * @param data 设置心跳数据
     */
    setHeartBeat(cmd: number, cmdName: string, data: any): void {
        this._heartBeatCmd = cmd;
        this._heartBeatCmdName = cmdName;
        this._heartBeatData = data;
    }

    getHeartBeatCmd(): number {
        return this._heartBeatCmd;
    }
    getHeartBeatCmdName(): string {
        return this._heartBeatCmdName;
    }
    getHeartBeatData(): any {
        return this._heartBeatData;
    }

    getProtocolType(): ProtocolType {
        return ProtocolType.Protobuf;
    }
}