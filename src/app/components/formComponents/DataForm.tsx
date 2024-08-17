import { Form } from "react-final-form";
import { Campaign } from "../../domains/Campaign";
import { MinMaxNumberInput, MinMaxDateInput } from "./inputs/MinMaxInput";
import { CampaignArgs } from "../../../../types";

const groupClassNames =
  "group w-full lg:w-1/4 mx-4 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:bg-opacity-10 ";

const stackedClasses = `lg:basis-2/4 py-2 flex-grow`




export const DataForm = ({
  handleSetCampaign,
  handleSetIsProcessing,
  isProcessing,
}: {
  handleSetCampaign: (props: Campaign | null) => void;
  handleSetIsProcessing: (props: boolean) => void;
  isProcessing: boolean;
}) => {
  const onSubmit = (values: Record<string, any>) => {
    handleSetIsProcessing(true);
    const startDateMin = new Date(
      values.campaignStartDateRangeMin.replace("-", "/")
    ).getTime();
    const startDateMax = new Date(
      values.campaignStartDateRangeMax.replace("-", "/")
    ).getTime();

    const endDateMin = new Date(
      values.campaignEndDateRangeMin.replace("-", "/")
    ).getTime();
    const endDateMax = new Date(
      values.campaignEndDateRangeMax.replace("-", "/")
    ).getTime();

    const args: CampaignArgs = {
      startDateRange: [startDateMin, startDateMax],
      endDateRange: [endDateMin, endDateMax],
      adsetsPerCampaignRange: [
        values.numAdsetsPerCampaignsMin,
        values.numAdsetsPerCampaignsMax,
      ].map(Number),
      adsPerAdsetRange: [values.numAdsPerAdsetMin, values.numAdsPerAdsetMax].map(
        Number
      ),
      spendRange: [values.dailySpendMin, values.dailySpendMax].map(Number),
      cpmRange: [values.cpmMin, values.cpmMax].map(Number),
      ctrRange: [values.ctrMin, values.ctrMax].map(Number),
      cpaRange: [values.cpaMin, values.cpaMax].map(Number),
      atcRateRange: [values.atcRateMin, values.atcRateMin].map(Number),
      aovRange: [values.aovMin, values.aovMax].map(Number)
    };
    console.log(args);
    const campaign = new Campaign(args);
    setTimeout(() => {
      campaign.runCampaign();
      handleSetCampaign(campaign);
    }, 0);
  };
  const validate = (values: Record<string, any>) => {
    const errors: Record<string, any> = {};

    return errors;
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-wrap justify-center">
            <fieldset className={`${groupClassNames} flex-grow`}>
              <h2 className="m-2 font-bold text-2xl">Campaigns</h2>
              <div className="flex flex-wrap">
                <MinMaxNumberInput
                  name="numCampaigns"
                  label="Number of campaigns*"
                  defaultValues={[1, 1]}
                  disabled
                  className={`flex-grow`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <MinMaxDateInput
                  name="campaignStartDateRange"
                  label="Campaign start range:"
                  defaultValues={["2024-01-01", "2024-01-01"]}
                  className={`${stackedClasses} pr-2`}
                />
                <MinMaxDateInput
                  name="campaignEndDateRange"
                  label="Campaign end range:"
                  defaultValues={["2024-01-31", "2024-01-31"]}
                  className={`${stackedClasses} pl-2`}
                />
                <MinMaxNumberInput
                  name="numAdsetsPerCampaigns"
                  label="Adsets per campaign"
                  defaultValues={[3, 5]}
                  className={`${stackedClasses} pr-2`}
                />
                <MinMaxNumberInput
                  name="numAdsPerAdset"
                  label="Ads per adset"
                  defaultValues={[3, 6]}
                  className={`${stackedClasses} pl-2`}
                />
              </div>
            </fieldset>
            <fieldset className={`${groupClassNames} flex-grow`}>
              <h2 className="m-2 font-bold text-2xl">Metrics</h2>
              <div className="flex flex-wrap">
                <MinMaxNumberInput
                  name="dailySpend"
                  label="Daily ad spend"
                  defaultValues={[1000, 10000]}
                  className={`${stackedClasses} pr-2`}
                />
                <MinMaxNumberInput
                  name="cpm"
                  label="Target CPM"
                  defaultValues={[25, 45]}
                  className={`${stackedClasses} pl-2`}
                />
                <MinMaxNumberInput
                  name="ctr"
                  label="Target CTR"
                  defaultValues={[0.004, 0.035]}
                  className={`${stackedClasses} pr-2`}
                />
                <MinMaxNumberInput
                  name="cpa"
                  label="Target CPA"
                  defaultValues={[35, 150]}
                  className={`${stackedClasses} pl-2`}
                />
                <MinMaxNumberInput
                  name="aov"
                  label="Target AOV"
                  defaultValues={[40, 250]}
                  className={`${stackedClasses} pr-2`}
                />
                <MinMaxNumberInput
                  name="atcRate"
                  label="Add to Cart Rate"
                  defaultValues={[0.002, 0.25]}
                  className={`${stackedClasses} pl-2`}
                />
              </div>
            </fieldset>
          </div>
          <button
            className="bg-transparent border text-white py-2 px-3 rounded-lg mx-auto my-12 md:w-1/4 hover:bg-gray-100 hover:bg-opacity-10"
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Submit"}
          </button>
        </form>
      )}
    />
  );
};
