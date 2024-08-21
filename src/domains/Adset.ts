import { Ad } from "./Ad";

export class Adset {
    public name: string = "Adset";
    public ads: Ad[] = [];

    constructor() {
        this.name = `Adset_${Math.round(Math.random() * 100000000)}`
    }
}
