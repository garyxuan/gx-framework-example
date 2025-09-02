/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:15:19
 * @Description: 
 */
export interface IModule {
    // 模块名称
    moduleName: string;

    // 初始化
    init(): void;
}