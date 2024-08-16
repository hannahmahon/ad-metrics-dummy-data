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
    public dailyClicks: number[] = [];
    public dailyCpm: number[] = [];
    public dailyCtrs: number[] = [];
    public dayTrends: number[] = [];
    public totalCpmTarget: number = 0; // Target CPM for the entire campaign


    constructor({ campaignName, adsetName, daysInCampaign }: { campaignName: string; adsetName: string; daysInCampaign: number }) {
        this.campaignName = campaignName;
        this.adsetName = adsetName;
        this.name = `Ad_${Math.round(Math.random() * 100000000)}`

        const maxNumberOfTrends = Math.min(Math.floor(daysInCampaign / minimumTrendDays) - 1, 1)
        const num = generateRandomNumber([1, maxNumberOfTrends])
        const numTrendPhases = Math.floor(num)
        let daysAvailable = daysInCampaign;
        Array(numTrendPhases).fill(0).forEach((_, i) => {
            const needThisManyRemaining = (numTrendPhases - i) * minimumTrendDays
            const maxDaysForThisTrend = daysAvailable - needThisManyRemaining
            let daysInTrend = Math.floor(generateRandomNumber([minimumTrendDays, maxDaysForThisTrend]))
            if (i === numTrendPhases - 1) {
                daysInTrend = daysAvailable
            }
            daysAvailable -= daysInTrend;

            const direction = Math.round(Math.random()) === 0 ? 'up' : 'down';
            Array(daysInTrend).fill(0).forEach(() => {
                const dayStrength = generateRandomNumber([0, .15]);
                const trendFactor = direction === 'up' ? 1 + dayStrength : 1 - dayStrength;
                this.dayTrends.push(trendFactor)
            })
        })
    }
}

export class Campaign {
    public name: string = "Campaign";
    public adsets: Adset[] = [];
    public ads: Ad[] = [];

    public startDate: number;
    public endDate: number;
    public daysInCampaign: number;
    public dailyAdSpend: number;
    public cpm: number;
    public ctr: number;
    private normalizedFactors: number[];

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
        this.adsets = getArrayOfLengthBetween(numAdsetsPerCampaign).map(() => {
            const adset = new Adset();
            const adsetAds = getArrayOfLengthBetween(numAdsPerAdset).map(() => {
                return new Ad({
                    campaignName: this.name,
                    adsetName: adset.name,
                    daysInCampaign
                })
            })
            adset.ads = adsetAds;
            this.ads.push(...adsetAds);
            return adset;
        })
        const startDateFormatted = Math.round(generateRandomNumber(startDate))
        const endDateFormatted = Math.round(generateRandomNumber(endDate))
        const msBetweenDates = endDateFormatted - startDateFormatted
        const numDays = Math.round(msBetweenDates / dayInMs)

        console.log({ numDays })
        this.startDate = startDateFormatted;
        this.endDate = endDateFormatted;
        this.daysInCampaign = numDays;
        this.dailyAdSpend = Math.round(generateRandomNumber(dailyAdSpend));
        this.cpm = Math.round(generateRandomNumber(cpm));
        this.ctr = generateRandomNumber(ctr);


        // Generate random performance factors for each ad (using a Dirichlet distribution equivalent)
        const performanceFactors = Array(this.ads.length)
            .fill(0)
            .map(() => Math.random());

        const sumOfFactors = performanceFactors.reduce((sum, factor) => sum + factor, 0);
        this.normalizedFactors = performanceFactors.map((factor) => factor / sumOfFactors);

        // Assign random CPMs to each ad, adjusting them so that their weighted average equals the targetCampaignCPM
        // const randomCPMs = Array(this.ads.length)
        //     .fill(0)
        //     .map(() => {
        //         const val = this.cpm * (0.5 + Math.random() * 1.5)
        //         return val;
        //     }); // Random CPMs between 50% and 150% of the target

        // Calculate the total spend at these CPMs to adjust the overall CPM
        let totalSpendAtRandomCPMs = 0;
        let totalImpressionsAtRandomCPMs = 0;

        this.normalizedFactors.forEach((factor, index) => {
            const spend = factor * this.dailyAdSpend;
            const impressions = (spend / this.cpm) * 1000;
            totalSpendAtRandomCPMs += spend;
            totalImpressionsAtRandomCPMs += impressions;
        });

        // Assign total CPM targets for each ad based on their performance
        this.assignAdPerformanceTargets();
    }

    assignAdPerformanceTargets() {
        const totalTargetCPM = this.cpm * this.ads.length;

        // Calculate weights for "winner," "average," and "loser" categories
        const numAds = this.ads.length;
        const performanceWeights = this.calculatePerformanceWeights(numAds);

        // Assign CPM targets based on calculated weights
        this.ads.forEach((ad, index) => {
            ad.totalCpmTarget = totalTargetCPM * performanceWeights[index];
        });
    }

    calculatePerformanceWeights(numAds: number): number[] {
        // Sort ads by expected performance (e.g., higher indices mean lower performance)
        const sortedIndices = Array.from({ length: numAds }, (_, i) => i).sort((a, b) => a - b);

        // Assign higher weights to "winners" and lower to "losers"
        const totalWeight = numAds * (numAds + 1) / 2;
        return sortedIndices.map(index => (numAds - index) / totalWeight);
    }

    generateDailyCtrs(): number[] {
        // Create a slight random fluctuation around the campaign CTR for each ad
        const dailyCtrs = this.ads.map(() => {
            const fluctuation = (Math.random() * 1.5) - 0.5; // Fluctuate between -50% and +150% around the campaign CTR
            return this.ctr * (1 + fluctuation);
        });

        // Calculate the total impressions across all ads
        const totalImpressions = this.ads.reduce((sum, ad) => {
            return sum + ad.dailyImpressions[ad.dailyImpressions.length - 1]; // Sum the impressions for the latest day
        }, 0);

        // Calculate the total clicks based on the initial daily CTRs
        const totalClicks = dailyCtrs.reduce((sum, ctr, index) => {
            return sum + (ctr * this.ads[index].dailyImpressions[this.ads[index].dailyImpressions.length - 1]); // Sum the clicks
        }, 0);

        // Calculate the actual CTR across all ads
        const actualCtr = totalClicks / totalImpressions;

        // Calculate the adjustment factor to ensure the daily CTRs roll up to the campaign-level CTR
        const ctrAdjustmentFactor = this.ctr / actualCtr;

        // Adjust each ad's daily CTR based on the adjustment factor
        const adjustedDailyCtrs = dailyCtrs.map(ctr => ctr * ctrAdjustmentFactor);

        return adjustedDailyCtrs;
    }

    runCampaign() {
        console.log("TARGET CPM", this.cpm);

        // Generate data for each day
        for (let day = 0; day < this.daysInCampaign; day++) {
            // Introduce variability in daily spend distribution
            const dailyVariabilityFactors = Array(this.ads.length)
                .fill(0)
                .map(() => Math.random() * 2); // Introduces variability in the range [0, 2]

            const sumOfVariabilityFactors = dailyVariabilityFactors.reduce(
                (sum, factor) => sum + factor,
                0
            );

            // Calculate spend distribution for each ad
            const dailySpendDistribution = this.normalizedFactors.map(
                (factor, index) =>
                    (factor * this.dailyAdSpend * dailyVariabilityFactors[index]) /
                    sumOfVariabilityFactors
            );

            // Generate CPMs for each ad for the current day, adjusted by dayTrends and totalCpmTarget
            const dailyCPMs = this.ads.map((ad, index) => {
                const fluctuation = (Math.random() * 0.7) - 0.35; // Range [-0.35, 0.35]
                const baseCPM = ad.totalCpmTarget / this.daysInCampaign;
                return baseCPM * (1 + fluctuation) * (ad.dayTrends[day] || 1);
            });

            // Calculate the total spend and impressions for the day to adjust CPM
            let totalDailySpendAtRandomCPMs = 0;
            let totalDailyImpressionsAtRandomCPMs = 0;

            dailySpendDistribution.forEach((spend, index) => {
                const impressions = (spend / dailyCPMs[index]) * 1000;
                totalDailySpendAtRandomCPMs += spend;
                totalDailyImpressionsAtRandomCPMs += impressions;
            });
            // Generate CTRs for each ad for the current day, adjusted to roll up to the campaign-level CTR
            const dailyActualCPM = totalDailySpendAtRandomCPMs / (totalDailyImpressionsAtRandomCPMs / 1000);
            const dailyCpmAdjustmentFactor = this.cpm / dailyActualCPM;

            // Adjust CPMs to ensure the daily CPM rolls up to the target
            const adjustedDailyCPMs = dailyCPMs.map(cpm => cpm * dailyCpmAdjustmentFactor);

            dailySpendDistribution.forEach((spend, index) => {
                const impressions = (spend / adjustedDailyCPMs[index]) * 1000;
                this.ads[index].dailyImpressions.push(Math.round(impressions));
            })
            const dailyCtrs = this.generateDailyCtrs();


            // Calculate impressions and clicks based on adjusted CPMs and store data
            console.log(dailyCtrs)
            dailySpendDistribution.forEach((spend, index) => {
                const impressions = this.ads[index].dailyImpressions[day];
                const clicks = Math.round(impressions * dailyCtrs[index]); // Use individual daily CTR
                this.ads[index].dailyAdSpend.push(spend);
                this.ads[index].dailyClicks.push(clicks); // Store clicks
                this.ads[index].dailyCpm.push(adjustedDailyCPMs[index]);
                this.ads[index].dailyCtrs.push(dailyCtrs[index]); // Store CTRs
            });
        }
    }

    downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8," + "Day,Ad name,Spend,Impressions,Clicks,Campaign,Adset" + "\r\n";
        for (let day = 0; day < this.daysInCampaign; day++) {
            this.ads.forEach(ad => {
                csvContent += `${day + 1},${ad.name},${ad.dailyAdSpend[day]},${ad.dailyImpressions[day]},${ad.dailyClicks[day]},${ad.campaignName},${ad.adsetName}`
                csvContent += "\r\n";
            })
        }

        const encodedUri = encodeURI(csvContent);
        window.open(encodedUri)
    }

    getTableData() {
        const columns = [
            { headerName: 'Day', field: 'day' },
            { headerName: 'Ad name', field: 'adName' },
            { headerName: 'Spend', field: 'spend' },
            { headerName: 'Impressions', field: 'impressions' },
            { headerName: 'Clicks', field: 'clicks' },
            { headerName: 'Campaign', field: 'campaign' },
            { headerName: 'Adset', field: 'adset' },
        ];
        const data: TableData["data"] = []
        for (let day = 0; day < this.daysInCampaign; day++) {
            this.ads.forEach(ad => {
                const date = formatDate(this.startDate + (day * dayInMs))
                data.push({
                    day: date,
                    adName: ad.name,
                    spend: ad.dailyAdSpend[day],
                    impressions: ad.dailyImpressions[day],
                    clicks: ad.dailyClicks[day],
                    campaign: ad.campaignName,
                    adset: ad.adsetName
                })
            })
        }

        return { columns, data: data.slice(0, 100) }
    }
}