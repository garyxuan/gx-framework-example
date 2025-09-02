import { warn } from "../tool/Log"

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:03:51
 * @Description: 
 */
export interface size {
    width: number;
    height: number;
}

export interface FrameConfig {
    /** 开启debug 默认false */
    debug?: boolean;
}

export let GX_DEBUG: boolean = false;


export function enableDebugMode(enable: boolean): void {
    if (enable) {
        GX_DEBUG = true;
        warn("enableDebugMode:true");
    }
    else {
        GX_DEBUG = false;
    }
}