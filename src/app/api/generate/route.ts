
import { generateRandomNumber, formatDate } from "@/app/utils";
import { Campaign } from "@/domains/Campaign";
import { CampaignArgs, CampaignResultData } from "../../../../types";
import cache from '../../../../cache';
import { NextRequest } from "next/server";
import BackBlazeClient from "@/app/backblaze/client";


const handleGenerateCampaigns = (values: Record<string, string | number>) => {
    const numCampaigns = Math.round(
        generateRandomNumber(
            [values.numCampaignsMin, values.numCampaignsMax].map(Number)
        )
    );
    const args: CampaignArgs = {
        daysInCampaign: Number(values.daysInCampaign),
        adsetsPerCampaignRange: [
            values.numAdsetsPerCampaignsMin,
            values.numAdsetsPerCampaignsMax,
        ].map(Number),
        adsPerAdsetRange: [
            values.numAdsPerAdsetMin,
            values.numAdsPerAdsetMax,
        ].map(Number),
        spendRange: [values.dailySpendMin, values.dailySpendMax].map(Number),
        cpmRange: [values.cpmMin, values.cpmMax].map(Number),
        ctrRange: [values.ctrMin, values.ctrMax].map(Number),
        cacRange: [values.cacMin, values.cacMax].map(Number),
        atcRateRange: [values.atcRateMin, values.atcRateMax].map(Number),
        aovRange: [values.aovMin, values.aovMax].map(Number),
    };
    const campaignData: CampaignResultData[] = [];
    let csvName = '';
    let csv = "";
    Array(numCampaigns)
        .fill(0)
        .forEach((_, i) => {
            const currentCampaign = new Campaign(args);
            csvName += csvName ? `_${currentCampaign.name}` : currentCampaign.name;
            currentCampaign.runCampaign();
            campaignData.push({
                name: currentCampaign.name,
                startDate: formatDate(currentCampaign.startDate, "mm/dd/yyyy"),
                endDate: formatDate(currentCampaign.endDate, "mm/dd/yyyy"),
                cpm: currentCampaign.cpm,
                ctr: currentCampaign.ctr,
                cac: currentCampaign.cac,
                aov: currentCampaign.aov,
                atcRate: currentCampaign.atcRate,
                data: currentCampaign.getTableData(),
            });
            if (i === 0) {
                csv = currentCampaign.getCsvPrefix();
            }
            csv += currentCampaign.csv;
        });

    return { csvName: `${csvName}.csv`, csv, campaignData };
};

// To handle a POST request to /api
export async function POST(request: NextRequest) {
    try {
        const values = await request.json();
        console.log({ values })
        const { csvName, csv, campaignData } = handleGenerateCampaigns(values);

        const backBlazeClient = new BackBlazeClient();
        await backBlazeClient.authenticate();
        await backBlazeClient.loadUploadUrl();
        await backBlazeClient.uploadFile(csvName, csv);

        return new Response(JSON.stringify({ csvName, campaignData }), { status: 200 })
    } catch (e: unknown) {
        const error = e as Error
        console.error(error);
        return new Response(JSON.stringify({ error: error.toString(), stack: error.stack }), { status: 500 })
    }
}