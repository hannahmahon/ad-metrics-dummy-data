"use client";
import React, { useState } from "react";
import { Fragment } from "react";
import { Form, Field, useFormState } from "react-final-form";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { Campaign, TableData } from "./components/Campaign";
import { GoDownload } from "react-icons/go";

const groupClassNames =
  "group w-full lg:w-1/4 mx-4 rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30";

type InputProps = {
  name: string;
  label: string | React.ReactNode;
  defaultValue: string | number;
  disabled?: boolean;
};
type MinMaxNumberInputProps = Omit<InputProps, "defaultValue"> & {
  defaultValues: [number, number];
};
type MinMaxDateInputProps = Omit<InputProps, "defaultValue"> & {
  defaultValues: [string | number, string | number];
};

const BoldUppercase = (props: { children: React.ReactNode }) => (
  <small className="font-bold uppercase">{props.children} </small>
);

const FieldWrapper = (props: { children: React.ReactNode }) => {
  return <div className="flex m-2 items-center w-full">{props.children}</div>;
};

const NumberInput = ({ name, label, defaultValue, disabled }: InputProps) => {
  const { values } = useFormState();
  return (
    <FieldWrapper>
      <React.Fragment>
        {label && <label>{label}</label>}
        <Field
          className={"my-2 ml-2 py-1 px-2 rounded-lg w-full"}
          name={name}
          component="input"
          type="number"
          defaultValue={defaultValue}
          disabled={disabled}
        />
      </React.Fragment>
    </FieldWrapper>
  );
};

const DateInput = ({ name, label, defaultValue }: InputProps) => {
  const { values } = useFormState();
  return (
    <FieldWrapper>
      <>
        <label>{label}</label>
        <Field
          className={"my-2 ml-2 py-1 px-2 w-full w-[198px] rounded-lg"}
          name={name}
          defaultValue={defaultValue}
          component="input"
          type="date"
        />
      </>
    </FieldWrapper>
  );
};

const MinMaxInput = ({
  label,
  defaultValues,
  name,
  Component,
  disabled,
}: MinMaxDateInputProps & { Component: (props: any) => JSX.Element }) => {
  return (
    <div>
      <h2 className="text-lg ml-2 mt-4">{label}</h2>
      <div className="flex flex-wrap sm:flex-nowrap w-full">
        <Component
          name={`${name}Min`}
          disabled={disabled}
          label={
            <Fragment>
              <BoldUppercase>Min</BoldUppercase>
            </Fragment>
          }
          defaultValue={defaultValues[0]}
        />
        <Component
          name={`${name}Max`}
          disabled={disabled}
          label={
            <Fragment>
              <BoldUppercase>Max</BoldUppercase>
            </Fragment>
          }
          defaultValue={defaultValues[1]}
        />
      </div>
    </div>
  );
};

const MinMaxDateInput = (props: MinMaxDateInputProps) => {
  return <MinMaxInput {...props} Component={DateInput} />;
};
const MinMaxNumberInput = (props: MinMaxNumberInputProps) => {
  return <MinMaxInput {...props} Component={NumberInput} />;
};

const MyForm = ({
  handleSetTableData,
  handleSetIsProcessing,
  isProcessing,
}: {
  handleSetTableData: (props: TableData | null) => void;
  handleSetIsProcessing: (props: boolean) => void;
  isProcessing: boolean;
}) => {
  const onSubmit = (values: Record<string, any>) => {
    handleSetIsProcessing(true);
    const startDateMin = new Date(values.campaignStartDateRangeMin).getTime();
    const startDateMax = new Date(values.campaignStartDateRangeMax).getTime();

    const endDateMin = new Date(values.campaignEndDateRangeMin).getTime();
    const endDateMax = new Date(values.campaignEndDateRangeMax).getTime();

    const args = {
      startDate: [startDateMin, startDateMax],
      endDate: [endDateMin, endDateMax],
      numAdsetsPerCampaign: [
        values.numAdsetsPerCampaignsMin,
        values.numAdsetsPerCampaignsMax,
      ].map(Number),
      numAdsPerAdset: [values.numAdsPerAdsetMin, values.numAdsPerAdsetMax].map(
        Number
      ),
      dailyAdSpend: [values.dailySpendMin, values.dailySpendMax].map(Number),
      cpm: [values.cpmMin, values.cpmMax].map(Number),
      ctr: [values.ctrMin, values.ctrMax].map(Number),
    };
    console.log(args);
    const campaign = new Campaign(args);
    window.campaign = campaign;
    setTimeout(() => {
      campaign.runCampaign();
      handleSetTableData(campaign.getTableData());
    }, 0)
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
        <form onSubmit={handleSubmit} className="flex flex-wrap justify-center">
          <fieldset className={`${groupClassNames}`}>
            <h2 className="m-2 font-bold text-2xl">Campaigns</h2>
            <MinMaxNumberInput
              name="numCampaigns"
              label="Number of campaigns*"
              defaultValues={[1, 1]}
              disabled
            />
            <MinMaxNumberInput
              name="dailySpend"
              label="Daily ad spend"
              defaultValues={[1000, 120000]}
            />
            <MinMaxNumberInput
              name="cpm"
              label="Target CPM"
              defaultValues={[9, 45]}
            />
            <MinMaxNumberInput
              name="ctr"
              label="Target CTR"
              defaultValues={[0.004, 0.035]}
            />
          </fieldset>
          <fieldset className={`${groupClassNames} `}>
            <h2 className="m-2 font-bold text-2xl">Date Range</h2>
            <MinMaxDateInput
              name="campaignStartDateRange"
              label="All campaigns should start between:"
              defaultValues={["2024-01-01", "2024-01-01"]}
            />
            <MinMaxDateInput
              name="campaignEndDateRange"
              label="All campaigns should end between:"
              defaultValues={["2024-01-31", "2024-01-31"]}
            />
            <h2 className="m-2 font-bold text-2xl">Ads</h2>
            <MinMaxNumberInput
              name="numAdsetsPerCampaigns"
              label="Number of adsets per campaign"
              defaultValues={[3, 5]}
            />
            <MinMaxNumberInput
              name="numAdsPerAdset"
              label="Number of ads per adset"
              defaultValues={[3, 6]}
            />
          </fieldset>
          <fieldset className={`${groupClassNames}`}>
            <h2 className="m-2 font-bold text-2xl">Other</h2>
            <MinMaxNumberInput
              name="clickToATCRatio"
              label="Add to Cart Rate*"
              defaultValues={[0.002, 0.25]}
            />
            <MinMaxNumberInput
              name="aov"
              label="Average Order Value*"
              defaultValues={[40, 250]}
            />
            <MinMaxNumberInput
              name="cac"
              label="Customer Acquisition Cost*"
              defaultValues={[35, 150]}
            />
            <MinMaxNumberInput
              name="roas"
              label="Return on Ad Spend*"
              defaultValues={[0.5, 2.5]}
            />
          </fieldset>

          <button
            className="bg-gray-900 text-white py-2 px-3 rounded-lg my-12 w-1/4"
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

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tableData, setTableData] = useState<TableData | null>(null);

  const handleDownloadCSV = () => {
    if (!tableData) return;
    let csvContent =
      "data:text/csv;charset=utf-8," +
      tableData?.columns.map(({ headerName }) => headerName).join(",") +
      "\r\n";
    csvContent += tableData.data
      .map((datum) => Object.values(datum).join(","))
      .join("\r\n");
    window.open(encodeURI(csvContent));
  };

  const handleSetTableData = (tableData: TableData | null) => {
    setTableData(tableData);
    setIsProcessing(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center md:p-24 m-auto">
      <div className="z-10 w-full items-center justify-center lg:flex mb-6">
        <h1 className="font-bold font-mono text-4xl mt-24 sm:mt-2 text-center w-full">
          Ad Metric Data Generator
        </h1>
      </div>

      <div className="mt-9 w-full">
        <div className="w-full">
          <MyForm
            handleSetTableData={handleSetTableData}
            isProcessing={isProcessing}
            handleSetIsProcessing={setIsProcessing}
          />
          <sub className="text-center block">
            *To be implemented at a later date
          </sub>
        </div>
      </div>

      {tableData && (
        <div className="mt-9 w-full">
          <hr />
          <div className="flex my-9 items-center">
            <h2 className=" font-bold text-2xl">Campaign Report</h2>
            <button
              onClick={handleDownloadCSV}
              className="ml-3 flex items-center hover:text-rose-500"
            >
              <GoDownload />
              Download CSV
            </button>
          </div>
          <div className="ag-theme-alpine" style={{ width: "100%" }}>
            <AgGridReact
              rowData={tableData.data}
              columnDefs={tableData.columns}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
              }}
              domLayout="autoHeight"
              enableRangeSelection={true}
              clipboardDeliminator="\t"
            />
          </div>
        </div>
      )}
    </main>
  );
}
