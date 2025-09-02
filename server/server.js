const WebSocket = require('ws');
const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 8800 });

console.log('WebSocket服务器启动在端口 8800');

// 加载protobuf协议文件
let root;
try {
    const protoContent = fs.readFileSync(path.join(__dirname, '../assets/resources/a.proto'), 'utf8');
    root = protobuf.parse(protoContent).root;
    console.log('Protobuf协议加载成功');
} catch (error) {
    console.error('加载protobuf协议失败:', error);
    process.exit(1);
}

// 获取消息类型
const BaseCmd = root.lookupType('BaseCmd');
// const UserInfo = root.lookupType('UserInfo');
const PingResp = root.lookupType('PingResp');
const GetUserInfoResp = root.lookupType('GetUserInfoResp');
const EventServerReady = root.lookupType('EventServerReady');

// 验证消息
function verifyMessage(message) {
    const errMsg = BaseCmd.verify(message);
    if (errMsg) {
        throw new Error(errMsg);
    }
}

// 编码消息
function encodeMessage(message) {
    verifyMessage(message);
    return BaseCmd.encode(message).finish();
}

// 解码消息
function decodeMessage(buffer) {
    try {
        return BaseCmd.decode(buffer);
    } catch (error) {
        console.error('解码消息失败:', error);
        return null;
    }
}

// 处理连接
wss.on('connection', (ws) => {
    console.log('客户端连接成功');

    // 设置二进制类型
    ws.binaryType = 'arraybuffer';

    // 处理消息
    ws.on('message', (data) => {
        try {
            // 解码客户端消息
            const message = decodeMessage(Buffer.from(data));
            
            if (!message) {
                console.error('无法解码客户端消息');
                return;
            }

            console.log('收到客户端消息:', {
                cmd: message.cmd,
                reqId: message.reqId,
                code: message.code,
                msg: message.msg,
                dataLength: message.data ? message.data.length : 0
            });

            let resp = null;
            if (message.data) {
                try {
                    if (message.cmd === 1)
                    {
                        console.log("收到ping请求")
                        resp = {
                            cmd: message.cmd,
                            data: PingResp.encode({ time: Date.now() }).finish(),
                            reqId: message.reqId, // 返回相同的reqId
                            code: 0, // 成功状态
                            msg: 'success'
                        }
                    }
                    else if (message.cmd === 1001)
                    {
                        resp = {
                            cmd: message.cmd,
                            data:GetUserInfoResp.encode({userInfo: {uid: '111', nickName: '张三', avatar: 'http://www.baidu.com', gender: 1, level: 1, coin: 100}}).finish(),
                            reqId: message.reqId, // 返回相同的reqId
                            code: 0, // 成功状态
                            msg: 'success'
                        }
                    }
                    else
                    {
                        //其他仅打印一下
                        console.log('解析的用户信息:', message.data);
                    }
                } catch (error) {
                    console.log('error:',error);
                }
            }

            if (resp)
            {
                // 编码并发送响应
                const responseBuffer = encodeMessage(resp);
                ws.send(responseBuffer);
            }


            // console.log('发送响应:', {
            //     cmd: resp.cmd,
            //     reqId: resp.reqId,
            //     code: resp.code,
            //     msg: resp.msg
            // });

        } catch (error) {
            console.error('处理消息时出错:', error);
            
            // 发送错误响应
            const errorResponse = {
                cmd: 0,
                data: null,
                reqId: 0,
                code: 500,
                msg: '服务器内部错误'
            };
            
            try {
                const errorBuffer = encodeMessage(errorResponse);
                ws.send(errorBuffer);
            } catch (sendError) {
                console.error('发送错误响应失败:', sendError);
            }
        }
    });

    // 处理连接关闭
    ws.on('close', (code, reason) => {
        console.log('客户端断开连接:', code, reason);
    });

    // 处理错误
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
    });

    // 发送连接成功消息
    // const welcomeMessage = {
    //     cmd: 9999, // 欢迎消息
    //     data: null,
    //     reqId: 0,
    //     code: 0,
    //     msg: '连接成功'
    // };
    
    try {
        let resp = {
            cmd: 1000,
            data: EventServerReady.encode({userInfo: {uid: '111', nickName: '张三', avatar: 'http://www.baidu.com', gender: 1, level: 1, coin: 100}}).finish(),
            reqId: 0, // 返回相同的reqId
            code: 0, // 成功状态
            msg: 'success'
        }
        
        const msg = encodeMessage(resp);
        ws.send(msg);
        console.log('发送欢迎消息');
    } catch (error) {
        console.error('发送欢迎消息失败:', error);
    }
});

// 处理服务器关闭
wss.on('close', () => {
    console.log('WebSocket服务器关闭');
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
});

console.log('服务器启动完成，等待客户端连接...');
