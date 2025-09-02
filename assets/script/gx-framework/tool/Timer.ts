import { BinaryHeap, HeapNode } from "./DataStruct/BinaryHeap";
import { debug, error } from "./Log";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 19:01:11
 * @Description: 定时器
 */
export class Timer {
    // 定时器堆
    private _heap: BinaryHeap<TimerNode>;
    // 运行中的定时器
    private _runningTimer: Map<number, TimerNode>;
    // 暂停中的定时器
    private _pausedTimer: Map<number, TimerNode>;
    // 经过的时间
    private _elapsedTime: number = 0;
    // 定时器节点排序
    private _timerNodeOrder: number = 0;
    private static readonly MAX_ORDER_INDEX = 1000000; // 100万次后重置
    // 定时器id
    private static _timerId: number = 0;

    public getTimerCount(): number {
        return this._heap.count;
    }

    public constructor(initTimerCapacity: number = 1024) {
        this._heap = new BinaryHeap<TimerNode>(initTimerCapacity);
        this._pausedTimer = new Map<number, TimerNode>();
        this._runningTimer = new Map<number, TimerNode>();
    }

    /**
    * 启动一个定时器
    * @param callback 回调函数
    * @param interval 间隔时间（秒）
    * @param loop 0:执行一次, 1~n:执行n次, -1:无限循环
    * @returns 定时器id
    */
    public start(callback: () => void, interval: number, loop: number = 0): number {
        if (!callback || interval <= 0) {
            debug("Timer start error: callback is null or interval <= 0");
            return -1;
        }

        if (this._timerNodeOrder >= Timer.MAX_ORDER_INDEX) {
            this._timerNodeOrder = 0;
        }

        const timerNode = new TimerNode(++Timer._timerId);
        timerNode.callback = callback;
        timerNode.interval = interval;
        timerNode.loop = loop;
        timerNode.expireTime = this._elapsedTime + interval;
        timerNode.orderIndex = ++this._timerNodeOrder;
        timerNode.pause = false;
        timerNode.currentLoop = 0;

        this._runningTimer.set(timerNode.id, timerNode);
        this._heap.push(timerNode);

        return timerNode.id;
    }

    /**
     * 停止一个定时器
     * @param timerId 定时器id
     */
    public stop(timerId: number): boolean {
        // 先检查runningTimer
        let node = this._runningTimer.get(timerId);
        if (node) {
            this._runningTimer.delete(timerId);
            this._heap.remove(node);
            return true;
        }

        // 再检查pausedTimer
        node = this._pausedTimer.get(timerId);
        if (node) {
            this._pausedTimer.delete(timerId);
            return true;
        }
        return false;
    }

    /**
     * 暂停一个定时器
     * @param timerId 定时器id
     * @returns 是否暂停成功
     */
    public pause(timerId: number): boolean {
        const node = this._runningTimer.get(timerId);
        if (!node) {
            return false;
        }
        node.pause = true;
        node.pauseRemainTime = node.expireTime - this._elapsedTime;
        this._heap.remove(node);
        this._runningTimer.delete(timerId);
        this._pausedTimer.set(timerId, node);

        return true;
    }

    /**
     * 恢复一个定时器
     * @param timerId 定时器id
     * @returns 是否恢复成功
     */
    public resume(timerId: number): boolean {
        const node = this._pausedTimer.get(timerId);
        if (!node) {
            return false;
        }
        node.pause = false;
        node.expireTime = this._elapsedTime + node.pauseRemainTime;
        this._heap.push(node);
        this._pausedTimer.delete(timerId);
        this._runningTimer.set(timerId, node);

        return true;
    }

    /**
     * 更新定时器
     * @param deltaTime 时间间隔（秒）
     */
    public update(deltaTime: number): void {
        this._elapsedTime += deltaTime;

        while (!this._heap.empty) {
            const node = this._heap.top();
            if (node.expireTime > this._elapsedTime) {
                break;
            }

            try {
                node.callback();
            } catch (err) {
                error("Timer callback error: " + err);
            }

            if (node.loop === 0 || node.currentLoop == node.loop) {
                this._heap.pop();
                this._runningTimer.delete(node.id);
            }
            else if (node.loop === -1) {
                node.expireTime = this._elapsedTime + node.interval;
                this._heap.update(node);
            } else if (node.loop > 0) {
                node.currentLoop++;
                if (node.currentLoop < node.loop) {
                    node.expireTime = this._elapsedTime + node.interval;
                    this._heap.update(node);
                }
            }
        }
    }

    public clear(): void {
        this._heap.clear();
        this._runningTimer.clear();
        this._pausedTimer.clear();
        this._timerNodeOrder = 0;
    }
}


export class TimerNode extends HeapNode {
    /** 定时器ID */
    public id: number;

    /** 定时器添加索引，同一时间回调根据OrderIndex排序 */
    public orderIndex: number;

    /** 定时间隔 */
    public interval: number;

    /** 回调时间点 */
    public expireTime: number;

    /** 重复次数 */
    public loop: number = 0;

    /** 当前执行次数 */
    public currentLoop: number;

    /** 定时回调 */
    public callback: () => void;

    /** 暂停时剩余时间 */
    public pauseRemainTime: number;

    /** 是否暂停 */
    public pause: boolean;

    constructor(id: number) {
        super();
        this.id = id;
    }

    public lessThan(other: HeapNode): boolean {
        const otherTimerNode = other as TimerNode;

        if (Math.abs(this.expireTime - otherTimerNode.expireTime) <= 1e-5) {
            return this.orderIndex < otherTimerNode.orderIndex;
        }

        return this.expireTime < otherTimerNode.expireTime;
    }
}