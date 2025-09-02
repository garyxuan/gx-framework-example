/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:55:41
 * @Description: 
 */
export class MathTool {
    /**
     * 随机一个范围内的整数(包含min和max)
     * @param min 
     * @param max 
     * @returns 
     */
    public static rand(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * 随机一个范围内的浮点数(包含min和max)
     * @param min 
     * @param max 
     * @returns 
     */
    public static randRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * 角度转弧度
     * @param angle 
     * @returns 
     */
    public static radian(angle: number): number {
        return angle * Math.PI / 180;
    }

    /**
     * 度
     * @param degree 
     * @returns 
     */
    public static degree(radian: number): number {
        return radian * 180 / Math.PI;
    }

}