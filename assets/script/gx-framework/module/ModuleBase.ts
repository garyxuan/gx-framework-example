import { Component } from "cc";
import { IModule } from "../global/IModule";

/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-29 14:03:53
 * @Description:
 */
export abstract class ModuleBase extends Component implements IModule {
    /** 模块名称 */
    public moduleName: string = "";

    /** 初始化 */
    public init(): void { }

    /** 模块初始化完成后调用的函数 */
    protected onInit(): void { }
}