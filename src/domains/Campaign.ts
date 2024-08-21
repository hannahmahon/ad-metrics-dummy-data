import { CampaignArgs, TableData } from "../../types";
import { parseCurrency, dayInMs, getArrayOfLengthBetween, formatDate } from "../app/utils";
import { Ad } from "./Ad";
import { Adset } from "./Adset";


type AdsetArgs = {
    daysInCampaign: number;
    adsetsPerCampaignRange: number[];
    adsPerAdsetRange: number[];
    cpmRange: number[];
    ctrRange: number[];
    cacRange: number[];
    spendRange: number[];
    atcRateRange: number[];
    aovRange: number[];
}
export class Campaign {
    public name: string = "Campaign";
    public adsets: Adset[] = [];
    public ads: Ad[] = [];

    public startDate: number;
    public endDate: number;
    public daysInCampaign: number;
    public currentDaysInCampaign: number;
    public currentStartDate: number;

    public cpm: number = 0;
    public ctr: number = 0;
    public cac: number = 0;
    public aov: number = 0;
    public atcRate: number = 0;

    public csv: string = '';

    constructor({
        daysInCampaign,
        // startDateRange,
        // endDateRange,
        adsetsPerCampaignRange = [2, 4],
        adsPerAdsetRange = [2, 4],
        spendRange = [1000, 120000],
        cpmRange = [9, 45],
        ctrRange = [.004, .035],
        cacRange = [35, 150],
        atcRateRange = [.002, .25],
        aovRange = [40, 250]
    }: CampaignArgs) {
        this.name = `Campaign_${Math.round(Math.random() * 100000000)}`

        // const startDate = Math.round(generateRandomNumber(startDateRange))
        // const endDate = Math.round(generateRandomNumber(endDateRange))
        // const msBetweenDates = endDate - startDate
        // const numDays = Math.round(msBetweenDates / dayInMs)

        const today = new Date().getTime();
        this.startDate = new Date(today - (daysInCampaign * dayInMs)).getTime();
        this.currentStartDate = this.startDate;
        this.endDate = today;
        this.daysInCampaign = daysInCampaign;
        this.currentDaysInCampaign = Math.min(daysInCampaign, 120);
        console.log(daysInCampaign)
        this.adsets = this.createAdsets({
            adsetsPerCampaignRange,
            adsPerAdsetRange,
            daysInCampaign: this.currentDaysInCampaign,
            spendRange,
            cpmRange,
            ctrRange,
            cacRange,
            atcRateRange,
            aovRange
        });
    }

    private createAdsets(props: AdsetArgs): Adset[] {
        return getArrayOfLengthBetween(props.adsetsPerCampaignRange).map(() => {
            const adset = new Adset();
            const adsetAds = getArrayOfLengthBetween(props.adsetsPerCampaignRange).map(() => {
                const ad = new Ad({
                    campaignName: this.name,
                    adsetName: adset.name,
                    ...props
                });
                this.ads.push(ad);
                return ad;
            });
            adset.ads = adsetAds;
            return adset;
        });
    }


    public runCampaign() {
        const numberOfBatches = Math.ceil(this.daysInCampaign / this.currentDaysInCampaign);
        const batches = Array(numberOfBatches).fill(0);
        batches.forEach((batch, i) => {
            const totalDaysFinishedSoFar = i * this.currentDaysInCampaign * dayInMs;
            this.currentDaysInCampaign = Math.min(
                this.currentDaysInCampaign, Math.round(this.daysInCampaign - (this.currentDaysInCampaign * i))
            )
            this.currentStartDate = this.startDate + totalDaysFinishedSoFar
            this.ads.forEach(ad => {
                ad.runCampaign(this.currentDaysInCampaign)
            });

            const { impressions, spend, clicks, purchases, revenue, atc } = this.ads.reduce((acc, ad) => {
                acc.impressions += ad.dailyImpressions.reduce((acc, num) => acc + num, 0)
                acc.spend += ad.dailyAdSpend.reduce((acc, num) => acc + num, 0)
                acc.clicks += ad.dailyClicks.reduce((acc, num) => acc + num, 0)
                acc.purchases += ad.dailyPurchases.reduce((acc, num) => acc + num, 0)
                acc.revenue += ad.dailyRevenue.reduce((acc, num) => acc + num, 0)
                acc.atc += ad.dailyAddsToCart.reduce((acc, num) => acc + num, 0)
                return acc;
            }, { impressions: 0, spend: 0, clicks: 0, purchases: 0, revenue: 0, atc: 0 })

            // time to do the 'weighting' of the average
            const currentCpm = spend / (impressions / 1000);
            const currentCtr = clicks / impressions;
            const currentCac = spend / purchases;
            const currentAov = revenue / purchases;
            const currentAtcRate = atc / clicks;
            this.cpm = ((this.cpm * i) + currentCpm) / (i + 1)
            this.ctr = ((this.ctr * i) + currentCtr) / (i + 1)
            this.atcRate = ((this.atcRate * i) + currentAtcRate) / (i + 1)
            this.cac = ((this.cac * i) + currentCac) / (i + 1)
            this.aov = ((this.aov * i) + currentAov) / (i + 1)

            this.csv += this.getPartialCsv();
        })
    }

    getFormattedAdValue(ad: Ad, day: number) {
        return {
            ad: ad.name,
            spend: ad.dailyAdSpend[day],
            impressions: Math.round(ad.dailyImpressions[day]),
            clicks: Math.round(ad.dailyClicks[day]),
            addsToCart: Math.round(ad.dailyAddsToCart[day]),
            revenue: parseCurrency(ad.dailyRevenue[day]),
            purchases: Math.round(ad.dailyPurchases[day]),
            campaign: ad.campaignName,
            adset: ad.adsetName,
            cpm: parseCurrency(ad.dailyAdSpend[day] / (ad.dailyImpressions[day] / 1000)),
            ctr: ad.dailyClicks[day] / ad.dailyImpressions[day],
        }
    }

    public getCsvPrefix() {
        const prefix = "";//"data:text/csv;charset=utf-8,";
        const columns = "Date,Ad name,Spend,Impressions,Clicks,Adds to cart,Revenue,Purchases,Campaign,Adset"
        return (prefix + columns + "\r\n")
    }

    private getPartialCsv() {
        let csvContent = "";
        this.ads.forEach(ad => {
            for (let day = 0; day < ad.dailyAdSpend.length; day++) {
                const date = formatDate(this.currentStartDate + (day * dayInMs))
                const { ad: name, spend, impressions, clicks, addsToCart, revenue, purchases, campaign, adset } = this.getFormattedAdValue(ad, day);
                csvContent += [date, name, spend, impressions, clicks, addsToCart, revenue, purchases, campaign, adset].join(',')
                csvContent += "\r\n";
            }
        });
        return csvContent;
    }

    public downloadCSV() {
        // const prefix = "data:text/csv;charset=utf-8,";
        // let csvContent = includePrefix ? (prefix +
        //     "Date,Ad name,Spend,Impressions,Clicks,Adds to cart,Revenue,Purchases,Campaign,Adset" + "\r\n"
        // ) : "";
        // this.ads.forEach(ad => {
        //     for (let day = 0; day < ad.dailyAdSpend.length; day++) {
        //         const date = formatDate(this.startDate + (day * dayInMs))
        //         const { ad: name, spend, impressions, clicks, addsToCart, revenue, purchases, campaign, adset } = this.getFormattedAdValue(ad, day);
        //         csvContent += [date, name, spend, impressions, clicks, addsToCart, revenue, purchases, campaign, adset].join(',')
        //         csvContent += "\r\n";
        //     }
        // });
        const encodedUri = encodeURI(this.csv);
        window.open(encodedUri);
    }

    getTableData() {
        const columns = [
            { headerName: 'Date', field: 'date' },
            { headerName: 'Ad name', field: 'ad' },
            { headerName: 'Spend', field: 'spend' },
            { headerName: 'Impressions', field: 'impressions' },
            { headerName: 'Clicks', field: 'clicks' },
            { headerName: 'Adds to cart', field: 'addsToCart' },
            { headerName: 'Revenue', field: 'revenue' },
            { headerName: 'Purchases', field: 'purchases' },
            { headerName: 'Campaign', field: 'campaign' },
            { headerName: 'Adset', field: 'adset' },
            { headerName: 'CPMs', field: 'cpm' },
            { headerName: 'CTRs', field: 'ctr' },
        ];
        const data: TableData["data"] = []
        let day = 0;
        while (data.length < 25 && day < this.daysInCampaign) {
            let adIndex = 0;
            while (adIndex < this.ads.length - 1) {
                const ad = this.ads[adIndex];
                const date = formatDate(this.startDate + (day * dayInMs))
                const adData = this.getFormattedAdValue(ad, day);
                if (data.length >= 25) {
                    break;
                }
                data.push({
                    date,
                    ...adData
                    // cpms: parseFloat((ad.dailyAdSpend[day] / (ad.dailyImpressions[day] / 1000)).toFixed(2)),
                    // ctrs: parseFloat((100 * ad.dailyClicks[day] / (ad.dailyImpressions[day])).toFixed(2)),
                })
                ++adIndex;
            }
            ++day;
        }
        return { columns, data }
    }
}