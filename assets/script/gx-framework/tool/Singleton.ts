/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-09-01 14:55:37
 * @Description: 通用单例类
 */
export class SingletonClass {
    // 这里的this不是参数，而是类型注解，意思是：this 必须是一个可以用 new 关键字调用的构造函数，且该构造函数返回类型为 T
    // 如果不这样写：错误！TypeScript 不知道 this 是什么
    public static getInstance<T, A extends any[]>(this: new (...args: A) => T, ...args: A): T {
        if (!(this as any).instance) {
            (this as any).instance = new this(...args);
        }
        return (this as any).instance;
    }

    protected constructor() {
        const clazz = this.constructor;//调用者类
        if ((clazz as any).instance) {
            throw new Error(`${clazz.name} can not be instantiated`);
        }
        (clazz as any).instance = this;
    }
}

class SingletonClass2 extends SingletonClass {
    constructor(a: number) {
        super();
    }
}

export let SingletonClazz = SingletonClass2.getInstance(1);
// export let bbbb = SingletonClass2.getInstance();
// export let ccc = new SingletonClass2(); // can not be instantiated
