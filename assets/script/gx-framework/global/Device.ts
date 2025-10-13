/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-18 13:39:49
 * @Description: n
 */
import { native } from "cc"
import { Platform } from "./Platform"

export class Device {
    // 短震动
    public static VibrateShort() {
        if (Platform.isNative) {
            if (Platform.isIOS) {
                native.reflection.callStaticMethod("MyNative", "VibrateShort:", "");
            }
        }
    }

    // 复制文本到剪贴板
    public static CopyTextToClipboard(text: string) {
        if (Platform.isNative) {
            if (Platform.isIOS) {
                native.reflection.callStaticMethod("MyNative", "CopyTextToClipboard:", text);
            }
        }
    }

    // 获取APP版本
    public static GetAppVersion() {
        if (Platform.isNative) {
            if (Platform.isIOS) {
                return native.reflection.callStaticMethod("MyNative", "GetAppVersion:", "");
            }
        }
        else {
            return "1.0";
        }
    }

    // 获取设备UUID
    // IOS14以上授权了则使用IDFA，否则使用VendorID
    // IOS14以下使用VendorID
    public static GetUUID() {
        if (Platform.isNative) {
            if (Platform.isIOS) {
                return native.reflection.callStaticMethod("MyNative", "GetUUID:", "");
            }
        }
        else {
            return "";
        }
    }
}