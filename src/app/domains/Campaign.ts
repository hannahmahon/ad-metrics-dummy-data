import { CampaignArgs, MinMaxRange, TableData } from "../../../types";
import { generateRandomNumber, dayInMs, getArrayOfLengthBetween, formatDate } from "../utils";
import { Ad } from "./Ad";
import { Adset } from "./Adset";


type AdsetArgs = {
    daysInCampaign: number;
    adsetsPerCampaignRange: number[];
    adsPerAdsetRange: number[];
    cpmRange: number[];
    ctrRange: number[];
    cpaRange: number[];
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
    public cpm: number = 0;
    public ctr: number = 0;

    constructor({
        startDateRange,
        endDateRange,
        adsetsPerCampaignRange = [2, 4],
        adsPerAdsetRange = [2, 4],
        spendRange = [1000, 120000],
        cpmRange = [9, 45],
        ctrRange = [.004, .035],
        cpaRange = [35, 150],
        atcRateRange = [.002, .25],
        aovRange = [40, 250]
    }: CampaignArgs) {
        this.name = `Campaign_${Math.round(Math.random() * 100000000)}`

        const startDate = Math.round(generateRandomNumber(startDateRange))
        const endDate = Math.round(generateRandomNumber(endDateRange))
        const msBetweenDates = endDate - startDate
        const numDays = Math.round(msBetweenDates / dayInMs)

        this.startDate = startDate;
        this.endDate = endDate;
        this.daysInCampaign = numDays;
        this.adsets = this.createAdsets({
            adsetsPerCampaignRange,
            adsPerAdsetRange,
            daysInCampaign: this.daysInCampaign,
            spendRange,
            cpmRange,
            ctrRange,
            cpaRange,
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
        this.ads.forEach(ad => ad.runCampaign());

        const { impressions, spend, clicks } = this.ads.reduce((acc, ad) => {
            acc.impressions += ad.dailyImpressions.reduce((acc, num) => acc + num, 0)
            acc.spend += ad.dailyAdSpend.reduce((acc, num) => acc + num, 0)
            acc.clicks += ad.dailyClicks.reduce((acc, num) => acc + num, 0)
            return acc;
        }, { impressions: 0, spend: 0, clicks: 0 })
        this.cpm = Math.round(spend / (impressions / 1000))
        this.ctr = clicks / impressions;
    }

    getFormattedAdValue(ad: Ad, day: number) {
        return {
            ad: ad.name,
            spend: ad.dailyAdSpend[day],
            impressions: Math.round(ad.dailyImpressions[day]),
            clicks: Math.round(ad.dailyClicks[day]),
            addsToCart: Math.round(ad.dailyAddsToCart[day]),
            revenue: ad.dailyRevenue[day],
            purchases: Math.round(ad.dailyPurchases[day]),
            campaign: ad.campaignName,
            adset: ad.adsetName,
            // cpms: parseFloat((ad.dailyAdSpend[day] / (ad.dailyImpressions[day] / 1000)).toFixed(2)),
            // ctrs: parseFloat((100 * ad.dailyClicks[day] / (ad.dailyImpressions[day])).toFixed(2)),
        }
    }

    public downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8," +
            "Date,Ad name,Spend,Impressions,Clicks,Adds to cart,Revenue,Purchases,Campaign,Adset" + "\r\n";
        this.ads.forEach(ad => {
            for (let day = 0; day < ad.dailyAdSpend.length; day++) {
                const date = formatDate(this.startDate + (day * dayInMs))
                const { ad: name, spend, impressions, clicks, addsToCart, revenue, purchases, campaign, adset } = this.getFormattedAdValue(ad, day);
                csvContent += [date, name, spend, impressions, clicks, addsToCart, revenue, purchases, campaign, adset].join(',')
                csvContent += "\r\n";
            }
        });
        const encodedUri = encodeURI(csvContent);
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
            // { headerName: 'CPMs', field: 'cpms' },
            // { headerName: 'CTRs', field: 'ctrs' },
        ];
        const data: TableData["data"] = []
        for (let day = 0; day < 100; day++) {
            this.ads.forEach(ad => {
                const date = formatDate(this.startDate + (day * dayInMs))
                const adData = this.getFormattedAdValue(ad, day);
                data.push({
                    date: date,
                    ...adData
                    // cpms: parseFloat((ad.dailyAdSpend[day] / (ad.dailyImpressions[day] / 1000)).toFixed(2)),
                    // ctrs: parseFloat((100 * ad.dailyClicks[day] / (ad.dailyImpressions[day])).toFixed(2)),
                })
            })
        }

        return { columns, data: data.slice(0, 100) }
    }
}