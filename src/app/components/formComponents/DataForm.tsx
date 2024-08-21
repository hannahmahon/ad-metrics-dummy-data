import { Form } from "react-final-form";
import { MinMaxNumberInput } from "./inputs/MinMaxInput";
import { SelectInput } from "./inputs/Select";
import { useMemo } from "react";

const groupClassNames =
  "group w-full lg:w-1/4 mx-4 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:bg-opacity-10 ";

const stackedClasses = ` py-1 flex-grow`;

export const DataForm = ({
  handleSubmit,
  isProcessing,
}: {
  handleSubmit: (values: Record<string, any>) => void;
  isProcessing: boolean;
}) => {
  const onSubmit = handleSubmit;

  const validate = (values: Record<string, any>) => {
    const errors: Record<string, any> = {};

    return errors;
  };

  const options = useMemo(() => {
    const halfYear = 6 * 30.437;
    const nineMonths = 9 * 30.437;
    const oneYear = 365;
    return [
      {
        name: "7 Days",
        value: 7,
      },{
        name: "30 Days",
        value: 30,
      },{
        name: "90 Days",
        value: 90,
      },{
        name: "6 Months",
        value: Math.round(halfYear)
      },{
        name: "9 Months",
        value: Math.round(nineMonths)
      },{
        name: "1 Year",
        value: oneYear
      },{
        name: "1½ Years",
        value: (oneYear + halfYear) 
      },{
        name: "2 Years",
        value: oneYear * 2
      }
    ];
  }, []);

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-wrap justify-center">
            <fieldset className={`${groupClassNames} flex-grow`}>
              {/* <h2 className="m-2 font-bold text-2xl">Make a Campaign</h2> */}
              <div className="flex flex-wrap">
              <MinMaxNumberInput
                  name="numCampaigns"
                  label="Number of campaigns"
                  defaultValues={[1, 1]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <SelectInput
                  name="daysInCampaign"
                  label={
                    <span className="text-lg ml-0 my-4 block">
                      Campaign duration
                    </span>
                  }
                  className="flex-col flex w-full mx-2 my-1"
                  defaultValue={options[0].value}
                  options={options}
                />
                <MinMaxNumberInput
                  name="numAdsetsPerCampaigns"
                  label="Adsets per campaign"
                  defaultValues={[3, 5]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <MinMaxNumberInput
                  name="numAdsPerAdset"
                  label="Ads per adset"
                  defaultValues={[3, 6]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <MinMaxNumberInput
                  name="dailySpend"
                  label="Daily ad spend"
                  defaultValues={[1000, 10000]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
              </div>
            </fieldset>
            <fieldset className={`${groupClassNames} flex-grow`}>
              {/* <h2 className="m-2 font-bold text-2xl hidden">Metrics</h2> */}
              <div className="flex flex-wrap">
                <MinMaxNumberInput
                  name="cpm"
                  label="Target CPM"
                  defaultValues={[25, 45]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <MinMaxNumberInput
                  name="ctr"
                  label="Target CTR"
                  defaultValues={[0.004, 0.035]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <MinMaxNumberInput
                  name="cac"
                  label="Target CAC"
                  defaultValues={[35, 150]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <MinMaxNumberInput
                  name="aov"
                  label="Target AOV"
                  defaultValues={[40, 250]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
                <MinMaxNumberInput
                  name="atcRate"
                  label="Add to Cart Rate"
                  defaultValues={[0.002, 0.25]}
                  className={`${stackedClasses}`}
                  rangeClassName={`md:flex-nowrap`}
                />
              </div>
            </fieldset>
          </div>
          <button
            className="bg-transparent border text-white py-2 px-3 rounded-lg mx-auto my-12 mb-2 md:w-1/4 hover:bg-gray-100 hover:bg-opacity-10"
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
