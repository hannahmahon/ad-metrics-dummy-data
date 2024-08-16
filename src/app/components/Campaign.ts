type MinMaxRange = number[];
export type TableData = {
    columns: { headerName: string; field: string; }[];
    data: Record<string, string | number>[];
};
const dayInMs = 1000 * 60 * 60 * 24;
function generateRandomNumber([min, max]: MinMaxRange) {
    return Math.random() * (max - min) + min;
};

function getArrayOfLengthBetween([min, max]: MinMaxRange) {
    const num = Math.floor(generateRandomNumber([max, min]))
    return Array(num).fill("")
}

const addLeadingZero = (num: number) => num < 10 ? `0${num}` : `${num}`;

export const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${addLeadingZero(date.getMonth() + 1)}-${addLeadingZero(date.getDate())}`;
}
// need at least 5 days for a trend
const minimumTrendDays = 5;

export type CampaignArgs = {
    daysInCampaign?: number;
    startDate: MinMaxRange;
    endDate: MinMaxRange;
    numAdsetsPerCampaign: MinMaxRange;
    numAdsPerAdset: MinMaxRange;
    dailyAdSpend: MinMaxRange;
    cpm: MinMaxRange;
    ctr: MinMaxRange;
}

class Adset {
    public name: string = "Adset";
    public ads: Ad[] = [];

    constructor() {
        this.name = `Adset_${Math.round(Math.random() * 100000000)}`
    }
}

class Ad {
    public name: string = "Ad";
    public campaignName: string = "Campaign";
    public adsetName: string = "Adset";
    public dailyAdSpend: number[] = [];
    public dailyImpressions: number[] = [];
    public dailyCpm: number[] = [];
    public dailyClicks: number[] = [];
    public dayTrends: number[] = [];
    private cpmRange: MinMaxRange;
    private ctrRange: MinMaxRange;
    private spendRange: MinMaxRange;
    private daysInCampaign: number;

    constructor({
        campaignName,
        adsetName,
        daysInCampaign,
        cpmRange,
        ctrRange,
        spendRange
    }: {
        campaignName: string;
        adsetName: string;
        daysInCampaign: number;
        cpmRange: MinMaxRange;
        ctrRange: MinMaxRange;
        spendRange: MinMaxRange;
    }) {
        this.campaignName = campaignName;
        this.adsetName = adsetName;
        this.name = `Ad_${Math.round(Math.random() * 100000000)}`;
        this.cpmRange = cpmRange;
        this.ctrRange = ctrRange;
        this.spendRange = spendRange;
        this.daysInCampaign = daysInCampaign;

        this.generateDayTrends();
    }

    // Generate random trend phases that affect CPM/CTR trends
    private generateDayTrends() {
        const maxNumberOfTrends = Math.floor(this.daysInCampaign / minimumTrendDays);
        const numTrendPhases = Math.floor(generateRandomNumber([0, maxNumberOfTrends]));
        let daysAvailable = this.daysInCampaign;

        Array(numTrendPhases).fill(0).forEach((_, i) => {
            const needThisManyRemaining = (numTrendPhases - i) * minimumTrendDays;
            const maxDaysForThisTrend = daysAvailable - needThisManyRemaining;
            let daysInTrend = Math.floor(generateRandomNumber([minimumTrendDays, maxDaysForThisTrend]));
            if (i === numTrendPhases - 1) {
                daysInTrend = daysAvailable;
            }
            daysAvailable -= daysInTrend;

            const direction = Math.round(Math.random()) === 0 ? 'up' : 'down';
            Array(daysInTrend).fill(0).forEach(() => {
                const dayStrength = generateRandomNumber([0, .2]);
                const trendFactor = direction === 'up' ? 1 + dayStrength : 1 - dayStrength;
                this.dayTrends.push(trendFactor);
            });
        });
    }

    // Calculate daily CPM based on trends and random fluctuation
    private calculateDailyCpm(day: number): number {
        const fluctuation = generateRandomNumber([-0.5, 1.5]); // 50% to 200% fluctuation
        const baseCpm = generateRandomNumber(this.cpmRange);
        const trendFactor = this.dayTrends[day] || 1;

        // Calculate the raw CPM value with trends and fluctuations
        let calculatedCpm = baseCpm * (1 + fluctuation) * trendFactor;

        // Clamp the CPM value to ensure it stays within the range
        calculatedCpm = Math.max(this.cpmRange[0] * generateRandomNumber([.75, 1.25]), Math.min(calculatedCpm, this.cpmRange[1]));

        return calculatedCpm;
    }

    // Calculate daily CTR based on trends and random fluctuation
    private calculateDailyCtr(day: number): number {
        const fluctuation = generateRandomNumber([-0.5, 1.5]); // 50% to 200% fluctuation
        const baseCtr = generateRandomNumber(this.ctrRange);
        const trendFactor = this.dayTrends[day] || 1;

        // Calculate the raw CTR value with trends and fluctuations
        let calculatedCtr = baseCtr * (1 + fluctuation) * trendFactor;

        // Clamp the CTR value to ensure it stays within the range
        calculatedCtr = Math.max(this.ctrRange[0] * generateRandomNumber([.75, 1.25]), Math.min(calculatedCtr, this.ctrRange[1]));

        return calculatedCtr;
    }

    // Run the ad campaign for the specified number of days
    public runCampaign() {
        for (let day = 0; day < this.daysInCampaign; day++) {
            const cpm = this.calculateDailyCpm(day);
            const ctr = this.calculateDailyCtr(day);

            const spend = generateRandomNumber(this.spendRange);
            const impressions = (spend / cpm) * 1000;
            const clicks = impressions * ctr;

            this.dailyAdSpend.push(spend);
            this.dailyImpressions.push(impressions);
            this.dailyCpm.push(cpm);
            this.dailyClicks.push(clicks);
        }
    }

    // Optionally export data as CSV
    public toCSV() {
        let csvContent = "data:text/csv;charset=utf-8," + "Day,Ad name,Spend,Impressions,Clicks,Campaign,Adset" + "\r\n";
        for (let day = 0; day < this.daysInCampaign; day++) {
            csvContent += `${day + 1},${this.name},${this.dailyAdSpend[day]},${this.dailyImpressions[day]},${this.dailyClicks[day]},${this.campaignName},${this.adsetName}`;
            csvContent += "\r\n";
        }
        return csvContent;
    }
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
        startDate,
        endDate,
        daysInCampaign = 30,
        numAdsetsPerCampaign = [2, 4],
        numAdsPerAdset = [2, 4],
        dailyAdSpend = [1000, 120000],
        cpm = [9, 45],
        ctr = [.004, .035]
    }: CampaignArgs) {
        this.name = `Campaign_${Math.round(Math.random() * 100000000)}`

        const startDateFormatted = Math.round(generateRandomNumber(startDate))
        const endDateFormatted = Math.round(generateRandomNumber(endDate))
        const msBetweenDates = endDateFormatted - startDateFormatted
        const numDays = Math.round(msBetweenDates / dayInMs)

        console.log({ numDays })
        this.startDate = startDateFormatted;
        this.endDate = endDateFormatted;
        this.daysInCampaign = numDays;
        this.adsets = this.createAdsets(numAdsetsPerCampaign, numAdsPerAdset, daysInCampaign, cpm, ctr, dailyAdSpend);
    }

    private createAdsets(numAdsetsPerCampaign: MinMaxRange, numAdsPerAdset: MinMaxRange, daysInCampaign: number, cpmRange: MinMaxRange, ctrRange: MinMaxRange, spendRange: MinMaxRange): Adset[] {
        return getArrayOfLengthBetween(numAdsetsPerCampaign).map(() => {
            const adset = new Adset();
            const adsetAds = getArrayOfLengthBetween(numAdsPerAdset).map(() => {
                const ad = new Ad({
                    campaignName: this.name,
                    adsetName: adset.name,
                    daysInCampaign,
                    cpmRange,
                    ctrRange,
                    spendRange
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

    public downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8," + "Date,Ad name,Spend,Impressions,Clicks,Campaign,Adset" + "\r\n";
        this.ads.forEach(ad => {
            for (let day = 0; day < ad.dailyAdSpend.length; day++) {
                csvContent += `${formatDate(this.startDate + (day * dayInMs))},${ad.name},${ad.dailyAdSpend[day]},${ad.dailyImpressions[day]},${ad.dailyClicks[day]},${ad.campaignName},${ad.adsetName}`;
                csvContent += "\r\n";
            }
        });
        const encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    }

    getTableData() {
        const columns = [
            { headerName: 'Date', field: 'date' },
            { headerName: 'Ad name', field: 'adName' },
            { headerName: 'Spend', field: 'spend' },
            { headerName: 'Impressions', field: 'impressions' },
            // { headerName: 'CPMs', field: 'cpms' },
            // { headerName: 'CTRs', field: 'ctrs' },
            { headerName: 'Clicks', field: 'clicks' },
            { headerName: 'Campaign', field: 'campaign' },
            { headerName: 'Adset', field: 'adset' },
        ];
        const data: TableData["data"] = []
        for (let day = 0; day < this.daysInCampaign; day++) {
            this.ads.forEach(ad => {
                const date = formatDate(this.startDate + (day * dayInMs))
                data.push({
                    date: date,
                    adName: ad.name,
                    spend: ad.dailyAdSpend[day],
                    impressions: ad.dailyImpressions[day],
                    // cpms: parseFloat((ad.dailyAdSpend[day] / (ad.dailyImpressions[day] / 1000)).toFixed(2)),
                    // ctrs: parseFloat((100 * ad.dailyClicks[day] / (ad.dailyImpressions[day])).toFixed(2)),
                    clicks: ad.dailyClicks[day],
                    campaign: ad.campaignName,
                    adset: ad.adsetName
                })
            })
        }

        return { columns, data: data.slice(0, 100) }
    }
}