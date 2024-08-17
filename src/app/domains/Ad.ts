import { MinMaxRange } from "../../../types";
import { minimumTrendDays, generateRandomNumber } from "../utils";

export class Ad {
    public name: string = "Ad";
    public campaignName: string = "Campaign";
    public adsetName: string = "Adset";
    private daysInCampaign: number;
    private cpmRange: MinMaxRange;
    private ctrRange: MinMaxRange;
    private cpaRange: MinMaxRange;
    private spendRange: MinMaxRange;
    private atcRateRange: MinMaxRange;
    private aovRange: MinMaxRange;

    public dailyAdSpend: number[] = [];
    public dailyImpressions: number[] = [];
    public dailyCpm: number[] = [];
    public dailyClicks: number[] = [];
    public dailyCpmTrends: number[] = [];
    public dailyPurchases: number[] = [];
    public dailyAddsToCart: number[] = [];
    public dailyRevenue: number[] = [];

    constructor({
        campaignName,
        adsetName,
        daysInCampaign,
        cpmRange,
        ctrRange,
        cpaRange,
        atcRateRange,
        spendRange,
        aovRange
    }: {
        campaignName: string;
        adsetName: string;
        daysInCampaign: number;
        cpmRange: MinMaxRange;
        ctrRange: MinMaxRange;
        cpaRange: MinMaxRange;
        atcRateRange: MinMaxRange;
        spendRange: MinMaxRange;
        aovRange: MinMaxRange;
    }) {
        this.campaignName = campaignName;
        this.adsetName = adsetName;
        this.name = `Ad_${Math.round(Math.random() * 100000000)}`;
        this.cpmRange = cpmRange;
        this.ctrRange = ctrRange;
        this.cpaRange = cpaRange;
        this.aovRange = aovRange;
        this.atcRateRange = atcRateRange;
        this.spendRange = spendRange;
        this.daysInCampaign = daysInCampaign;

        this.generateDailyCpmTrends();
    }

    // Generate random trend phases that affect CPM/CTR trends
    private generateDailyCpmTrends() {
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
                this.dailyCpmTrends.push(trendFactor);
            });
        });
    }

    // Calculate daily CPM based on trends and random fluctuation
    private calculateDailyCpm(day: number): number {
        const fluctuation = generateRandomNumber([-0.5, 1.5]); // 50% to 200% fluctuation
        const baseCpm = generateRandomNumber(this.cpmRange);
        const trendFactor = this.dailyCpmTrends[day] || 1;

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
        const trendFactor = this.dailyCpmTrends[day] || 1;

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
            const cpa = generateRandomNumber(this.cpaRange)
            const atcRate = generateRandomNumber(this.atcRateRange);
            const spend = generateRandomNumber(this.spendRange);
            const aov = generateRandomNumber(this.aovRange);

            const impressions = (spend / cpm) * 1000;
            const clicks = impressions * ctr;
            const addsToCart = clicks * atcRate;
            const purchases = spend / cpa;
            const revenue = purchases * aov;

            this.dailyAdSpend.push(spend);
            this.dailyImpressions.push(impressions);
            this.dailyCpm.push(cpm);
            this.dailyClicks.push(clicks);
            this.dailyPurchases.push(purchases);
            this.dailyAddsToCart.push(addsToCart);
            this.dailyRevenue.push(revenue)
        }
    }
}
