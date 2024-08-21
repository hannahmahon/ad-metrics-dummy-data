import { MinMaxRange } from "../../types";
import { minimumTrendDays, generateRandomNumber } from "../app/utils";

export class Ad {
    public name: string = "Ad";
    public campaignName: string = "Campaign";
    public adsetName: string = "Adset";
    private daysInCampaign: number;

    public cpm: number;
    public ctr: number;
    public cac: number;
    public spend: number;
    public aov: number;
    public atcRate: number;

    private cpmRange: MinMaxRange;
    private ctrRange: MinMaxRange;
    private cacRange: MinMaxRange;
    private spendRange: MinMaxRange;
    private atcRateRange: MinMaxRange;
    private aovRange: MinMaxRange;

    public dailyAdSpend: number[] = [];
    public dailyImpressions: number[] = [];
    public dailyCpm: number[] = [];
    public dailyClicks: number[] = [];
    public dailyAtcTrends: number[] = [];
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
        cacRange,
        atcRateRange,
        spendRange,
        aovRange
    }: {
        campaignName: string;
        adsetName: string;
        daysInCampaign: number;
        cpmRange: MinMaxRange;
        ctrRange: MinMaxRange;
        cacRange: MinMaxRange;
        atcRateRange: MinMaxRange;
        spendRange: MinMaxRange;
        aovRange: MinMaxRange;
    }) {
        this.campaignName = campaignName;
        this.adsetName = adsetName;
        this.name = `Ad_${Math.round(Math.random() * 100000000)}`;
        this.cpmRange = cpmRange;
        this.ctrRange = ctrRange;
        this.cacRange = cacRange;
        this.aovRange = aovRange;
        this.atcRateRange = atcRateRange;
        this.spendRange = spendRange;
        this.cpm = generateRandomNumber(cpmRange);
        this.ctr = generateRandomNumber(ctrRange);
        this.cac = generateRandomNumber(cacRange);
        this.spend = generateRandomNumber(spendRange);
        this.aov = generateRandomNumber(aovRange);
        this.atcRate = generateRandomNumber(atcRateRange);
        this.daysInCampaign = daysInCampaign;
    }

    // Generate random trend phases that affect CPM/CTR trends
    private generateDailyTrends(trendField: 'dailyCpmTrends' | 'dailyAtcTrends', maxDayStrength: number = 0.35) {
        const isAdWinner = Math.round(Math.random()) === 1;
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

            // winner have slightly higher chance of more "ups", losers more "downs"
            const winnerMultiplier = isAdWinner ? 9 / 8 : 1 / 8;
            const direction = Math.round(Math.random()) * winnerMultiplier === 0 ? 'up' : 'down';
            Array(daysInTrend).fill(0).forEach(() => {
                const dayStrength = generateRandomNumber([0, maxDayStrength]);
                const trendFactor = direction === 'up' ? 1 + dayStrength : 1 - dayStrength;
                this[trendField].push(trendFactor);
            });
        });
    }

    private calculateDailyMetric(
        day: number,
        field: 'cpm' | 'ctr' | 'cac' | 'atcRate' | 'spend' | 'aov',
        trendField: 'dailyCpmTrends' | 'dailyAtcTrends'
    ) {
        const fluctuation = generateRandomNumber([-0.5, 1.5]); // 50% to 200% fluctuation
        const baseMetric = this[field];
        const trendFactor = this[trendField][day] || 1;

        // Calculate the raw CPM value with trends and fluctuations
        let calculatedMetric = baseMetric * trendFactor * (1 + fluctuation)

        // Clamp the CPM value to ensure it stays within the range
        calculatedMetric = Math.max(this[`${field}Range`][0] * generateRandomNumber([.75, 1.25]), Math.min(calculatedMetric, this[`${field}Range`][1] * generateRandomNumber([.95, 1.25])));

        return calculatedMetric;
    }

    // Run the ad campaign for the specified number of days
    public runCampaign(daysInCampaign: number) {
        this.daysInCampaign = daysInCampaign;
        this.dailyAdSpend = [];
        this.dailyImpressions = [];
        this.dailyCpm = [];
        this.dailyClicks = [];
        this.dailyCpmTrends = [];
        this.dailyPurchases = [];
        this.dailyAddsToCart = [];
        this.dailyRevenue = [];

        this.generateDailyTrends('dailyCpmTrends');
        this.generateDailyTrends('dailyAtcTrends');

        for (let day = 0; day < this.daysInCampaign; day++) {
            const cpm = this.calculateDailyMetric(day, 'cpm', 'dailyCpmTrends');
            const ctr = this.calculateDailyMetric(day, 'ctr', 'dailyCpmTrends');
            const spend = this.calculateDailyMetric(day, 'spend', 'dailyCpmTrends');
            const cac = this.calculateDailyMetric(day, 'cac', 'dailyAtcTrends');
            const atcRate = this.calculateDailyMetric(day, 'atcRate', 'dailyAtcTrends');
            const aov = this.calculateDailyMetric(day, 'aov', 'dailyAtcTrends');

            const impressions = (spend / cpm) * 1000;
            const clicks = impressions * ctr;
            const addsToCart = clicks * atcRate;
            const purchases = spend / cac;
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
