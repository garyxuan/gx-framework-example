import { Platform } from "../gx-framework/global/Platform";
import { HttpManager } from "../gx-framework/network/http/HttpManager";
import { debug } from "../gx-framework/tool/Log";
import { NetTaskBase } from "./NetTaskBase";

export class TestNetTask extends NetTaskBase {
    name: string = "TestNetTask";
    url: string = "https://test-api-global.v.show/system/translation";

    constructor() {
        super();
    }

    public start(): void {
        this.data = new Date().getTime();
        let url = this.url + "?keys[]=h5_party_tip_tip2";
        HttpManager.get(url, null, "json", this)
    }

    protected onTaskCompete(data: any): void {
        // debug("TestNetTask onTaskCompete: ", data)
    }
}