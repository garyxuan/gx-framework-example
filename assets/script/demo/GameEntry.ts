/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 19:08:12
 * @Description: 游戏入口
 */
import { CocosEntry } from "../gx-framework/cocos/CocosEntry";
import { FrameConfig, GX_DEBUG } from "../gx-framework/global/header";
import { _decorator, resources, sys, TextAsset } from "cc";
import { Platform } from "../gx-framework/global/Platform";
import { GlobalEvent } from "../gx-framework/global/GlobalEvent";
import { GlobalTimer } from "../gx-framework/global/GlobalTimer";
import { debug, error, warn } from "../gx-framework/tool/Log";
import { TestNetTask } from "./TestNetTask";
import { SocketNode } from "../gx-framework/network/socket/SocketNode";
import { ProtobufferHandler } from "../gx-framework/network/socket/ProtobufferHandler";
import { WebSock } from "../gx-framework/network/socket/WebSock";
const { ccclass, property } = _decorator;

@ccclass('GameEntry')
export class GameEntry extends CocosEntry {

    public getConfig(): FrameConfig {
        return { debug: true };
    }

    onInit(): void {
        debug("GameEntry onInit");

        GlobalEvent.setDebugMode(GX_DEBUG);

        let deviceId = sys.localStorage.getItem("GAME::UNIQUE_DEVICE_ID");
        debug("deviceId: " + deviceId);
        if (!deviceId || deviceId == "") {
            deviceId = "browser&" + Date.now().toString();
            sys.localStorage.setItem("GAME::UNIQUE_DEVICE_ID", deviceId);
        }
        Platform.deviceId = deviceId;

        // this.testTimer();
        // this.testEvent();
        // this.testHttp();
        this.testSocket();

    }

    private testTimer(): void {
        GlobalTimer.startTimer(() => {
            debug("一次性")
        }, 1, 0)
        GlobalTimer.startTimer(() => {
            debug("循环3次")
        }, 1, 3)
        let timerId1 = GlobalTimer.startTimer(() => {
            debug("无限循环1")
        }, 1, -1)
        let timerId2 = GlobalTimer.startTimer(() => {
            debug("无限循环2")
        }, 1, -1)
        GlobalTimer.startTimer(() => {
            GlobalTimer.pauseTimer(timerId1)
        }, 1)

        GlobalTimer.startTimer(() => {
            GlobalTimer.pauseTimer(timerId2)
        }, 4)
    }

    private testEvent() {
        GlobalEvent.on("GameEntry:test:event", () => {
            debug("GameEntry:test:event 执行")
        })
        GlobalTimer.startTimer(() => {
            GlobalEvent.emit("GameEntry:test:event", "test", 1, 2, 3)
            GlobalEvent.off("GameEntry:test:event")

            GlobalEvent.emit("GameEntry:test:event", "test", 1, 2, 3)
        }, 4)
    }

    private testHttp() {
        // HttpManager.get("https://test-api-global.v.show/system/translation?keys[]=h5_party_tip_tip2", null, "text", {
        //     onCompete: (response) => {
        //         debug("HttpManager.get onCompete: " + response.data)
        //     },
        //     onError: (response) => {
        //         debug("HttpManager.get onError: " + response.data)
        //     },
        //     onOpen: () => {
        //         debug("HttpManager.get onOpen")
        //     }
        // })
        let task = new TestNetTask();
        task.setCallback((data) => {
            debug("TestNetTask onSucceed: ", data)
        }, (message: string) => {
            debug("TestNetTask onFail: ", message)
        })
        task.start();
    }

    private testSocket() {
        let socketNode = new SocketNode();
        let protobufferHandler = new ProtobufferHandler();
        resources.load("a", TextAsset, (err, asset: TextAsset) => {
            if (err) {
                debug("load a.proto error: ", err)
            } else {
                protobufferHandler.addProto(asset.text);
                protobufferHandler.setHeartBeat(1, "Ping", {});
                socketNode.init(new WebSock(), protobufferHandler);
                socketNode.connect("ws://localhost:8800", {
                    binaryType: "arraybuffer",
                    autoReconnect: 10,
                    timeout: 10000
                }, {
                    // 首次连上
                    onConnected: () => {
                        error("GameEntry:onConnected")
                    },
                    // 断开了
                    onClose: (code: number) => {
                        error("GameEntry:onClose", code)
                    },
                    // 自动重连完成
                    onReconnected: () => {
                        error("GameEntry:onReconnected")
                    },
                    onReconnecting: () => {
                        error("GameEntry:onReconnecting")
                    }
                });
                // 监听模式
                socketNode.setResponseHandler(1000, "EventServerReady", this.onEventServerReady.bind(this), this);

                // 请求回应模式
                socketNode.request(1001, "GetUserInfo", { uid: "111" }, {
                    target: this,
                    callback: (cmd, data) => {
                        debug("SocketNode:request GetUserInfo: ", data)
                    }
                }, false, false);

                GlobalTimer.startTimer(() => {
                    socketNode.removeRequestListeners(1000)
                }, 7, 1);
            }
        })
    }

    private onEventServerReady(cmd: number, data: any) {
        warn("SocketNode:callback onEventServerReady: ", data)
    }
}