/*
 * @Author: garyxuan
 * @Version: V1.0
 * @Date: 2025-08-28 18:50:30
 * @Description:
 */
export class Utils {
    /**
     * 比较版本号(版本号格式为x.x.x)
     * @param version1 
     * @param version2 
     * @returns 返回1表示version1大于version2，返回0表示version1等于version2，返回-1表示version1小于version2
     */
    public static compareVersion(version1: string, version2: string): number {
        const v1 = version1.split(".");
        const v2 = version2.split(".");
        for (let i = 0; i < v1.length && i < v2.length; i++) {
            const diff = parseInt(v1[i]) - parseInt(v2[i]);
            if (diff !== 0) return diff;
        }
        return v1.length - v2.length;
    }

    /**
     * 判断是否是json字符串
     * @param str 
     * @returns 
     */
    public isJsonString(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 获取url参数
     * @param url 
     * @returns 
     */
    public getUrlParam(url: string): { [key: string]: string } {
        const search = url.split('?')[1];
        if (!search) return {};

        return search.split('&').reduce((acc, cur) => {
            const [key, value] = cur.split('=');
            acc[key] = value;
            return acc;
        }, {});
    }
}
