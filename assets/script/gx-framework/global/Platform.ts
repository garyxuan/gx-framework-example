/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:16:26
 * @Description: 
 */

export enum PlatformType {
    Unknown = 0,
    Android,
    IOS,
    HarmonyOS,
    /** 微信小游戏 */
    WX,
    /** 支付宝小游戏 */
    Alipay,
    /** 字节小游戏 */
    Bytedance,
    /** 华为快游戏 */
    HuaweiQuick,
    /** 其他都为Browser */
    Browser,
}

export class Platform {
    public static isBrowser: boolean = false;
    public static isNative: boolean = false;
    public static isMobile: boolean = false;
    public static isNativeMobile: boolean = false;
    public static isAndroid: boolean = false;
    public static isIOS: boolean = false;
    public static isHarmonyOS: boolean = false;
    public static isWX: boolean = false;
    public static isAlipay: boolean = false;
    public static isBytedance: boolean = false;
    public static isHuaweiQuick: boolean = false;

    public static platform: PlatformType = PlatformType.Unknown;

    public static deviceId: string;

}