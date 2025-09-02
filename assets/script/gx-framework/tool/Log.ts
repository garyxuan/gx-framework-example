import { GX_DEBUG } from "../global/header"

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:08:38
 * @Description: 
 */
function log(...args: any[]) {
    console.log("%c[GX] => ", 'color: #ff0000', ...args)
}

function warn(...args: any[]) {
    console.warn("%c[GX] => ", 'color: #ff0000', ...args)
}

function error(...args: any[]) {
    console.error("%c[GX] => ", 'color: #ff0000', ...args)
}

function info(...args: any[]) {
    console.log("%c[GX] => ", 'color:rgb(201, 98, 98)', ...args)
}

function debug(...args: any[]) {
    GX_DEBUG && console.log("%c[GX] => ", 'color: #ff0000', ...args)
}

export { log, warn, error, debug, info };