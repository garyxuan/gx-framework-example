import { debug, error, warn } from "../tool/Log";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-29 14:16:28
 * @Description: 
 */
class Event {
    public id: number;
    public name: string;
    public target: any;
    public once: boolean;
    public callback: (...args: any[]) => void;
}

export class GlobalEvent {
    // 记录事件
    private static eventMap: { [key: string]: Event[] } = {};
    // 记录映射关系
    private static eventIdMap: { [id: number]: { name: string, index: number } } = {};
    // 事件ID
    private static eventId: number = 0;
    // 调试模式
    private static debugMode: boolean = false;

    // 设置调试模式
    public static setDebugMode(debugMode: boolean) {
        this.debugMode = debugMode;
    }

    /**
     * 添加事件
     * @param name 事件名称
     * @param callback 事件回调
     * @param once 是否是一次性事件
     * @param target 事件目标
     * @returns 事件ID
     */
    public static on(name: string, callback: (...args: any[]) => void, target?: any): number {
        if (!name || !callback) {
            debug("GlobalEvent on name or callback is null");
            return 0;
        }
        if (!this.eventMap[name]) {
            this.eventMap[name] = [];
        }
        const eventId = ++this.eventId;
        const index = this.eventMap[name].length;
        this.eventMap[name].push({ id: eventId, name, callback, target, once: false });
        this.eventIdMap[eventId] = { name, index: index };
        if (this.debugMode) {
            debug(`GlobalEvent on name=> ${name} eventId=> ${eventId}`);
        }
        return eventId;
    }

    /**
     * 添加一次事件，执行一次后移除
     * @param name 事件名称
     * @param callback 事件回调
     * @param target 事件目标
     * @returns 事件ID
     */
    public static once(name: string, callback: (...args: any[]) => void, target?: any) {
        if (!name || !callback) {
            debug("GlobalEvent on name or callback is null");
            return 0;
        }
        if (!this.eventMap[name]) {
            this.eventMap[name] = [];
        }
        const eventId = this.eventId++;
        const index = this.eventMap[name].length;
        this.eventMap[name].push({ id: eventId, name, callback, target, once: true });
        this.eventIdMap[eventId] = { name, index: index };
        if (this.debugMode) {
            debug(`GlobalEvent once name=> ${name} eventId=> ${eventId}`);
        }
        return eventId;
    }

    /**
     * 触发事件
     * @param event 事件名称
     * @param args 事件参数
     */
    public static emit(name: string, ...args: any[]) {
        if (!name || !this.eventMap[name] || this.eventMap[name].length == 0) {
            if (this.debugMode) {
                debug(`GlobalEvent emit name is null or eventMap[${name}] is null`);
            }
            return;
        }
        const eventsToRemove = [];
        for (let event of this.eventMap[name]) {
            try {
                event.callback.call(event.target, ...args);
                if (event.once) {
                    eventsToRemove.push(event.id);
                }
            }
            catch (e) {
                error(`GlobalEvent emit error=> ${e}`);
            }
        }
        // 移除已执行的事件
        eventsToRemove.forEach(id => this.offId(id));

        if (this.debugMode) {
            debug(`GlobalEvent emit name=> ${name} args=> ${args}`);
        }
    }

    /**
     * 移除事件
     * @param name 
     */
    public static off(name: string) {
        if (!name) {
            warn("GlobalEvent off name is null");
            return;
        }
        if (this.eventMap[name] && this.eventMap[name].length > 0) {
            this.eventMap[name].forEach(element => {
                delete this.eventIdMap[element.id];
            });
        }
        this.eventMap[name] = [];
        if (this.debugMode) {
            debug(`GlobalEvent off name=> ${name}`);
        }
    }

    /**
     * 按事件ID移除事件
     * @param eventId 
     */
    public static offId(eventId: number) {
        const eventInfo = this.eventIdMap[eventId];
        if (eventInfo) {
            const { name, index } = eventInfo;
            this.eventMap[name].splice(index, 1);
            delete this.eventIdMap[eventId];

            // 更新后续事件的索引
            for (let i = index; i < this.eventMap[name].length; i++) {
                this.eventIdMap[this.eventMap[name][i].id].index = i;
            }

            if (this.debugMode) {
                warn(`GlobalEvent offId eventId=> ${eventId} name=> ${name}`);
            }
        }
    }

    /**
     * 移除指定目标的事件
     * @param target 目标
     */
    public static offTarget(target: any) {
        if (!target) {
            return;
        }
        let removedCount = 0;
        Object.keys(this.eventMap).forEach(name => {
            const events = this.eventMap[name];
            // 从后往前遍历，避免索引问题
            for (let i = events.length - 1; i >= 0; i--) {
                if (events[i].target == target) {
                    delete this.eventIdMap[events[i].id];
                    events.splice(i, 1);
                    removedCount++;
                }
            }
            if (removedCount > 0) {
                for (let i = 0; i < events.length; i++) {
                    this.eventIdMap[events[i].id].index = i;
                }
            }
        });
        if (this.debugMode && removedCount > 0) {
            warn(`GlobalEvent offTarget target=> ${target} removedCount=> ${removedCount}`);
        }
    }

    public static clear() {
        this.eventMap = {};
        this.eventIdMap = {};
        this.eventId = 0;
        if (this.debugMode) {
            debug("GlobalEvent clear");
        }
    }

    public static hasListeners(name: string): boolean {
        return this.getListenersCount(name) > 0;
    }

    public static getListenersCount(name: string): number {
        if (this.eventMap[name]) {
            return this.eventMap[name].length;
        }
        return 0;
    }

    /**
     * 获取事件名称列表
     * @returns 
     */
    public static getEventNames(): string[] {
        return Object.keys(this.eventMap);
    }

    /**
     * 获取目标的事件数量
     * @param target 
     * @returns 
     */
    public static getTargetEventCount(target: any): number {
        if (!target) {
            return 0;
        }
        let count = 0;
        Object.keys(this.eventMap).forEach(name => {
            count += this.eventMap[name].filter(e => e.target == target).length;
        });
        return count;
    }
}