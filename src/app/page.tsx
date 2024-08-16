"use client";
import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { GoDownload } from "react-icons/go";
import { DataForm } from "./components/formComponents/DataForm";
import { BoldUppercase } from "./components/BoldUppercase";
import { TableData } from "../../types";
import { Campaign } from "./domains/Campaign";
import { formatDate } from "./utils";


export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);

  const handleDownloadCSV = () => {
    if (!campaign) return;
    campaign.downloadCSV();
  };

  const handleSetCampaign = (newCampaign: Campaign | null) => {
    setCampaign(newCampaign);
    if (newCampaign) {
      setTableData(newCampaign.getTableData());
    }
    setIsProcessing(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center md:p-16 m-auto pb-12">
      <div className="bg-main fixed z-[-1] top-0 left-0 right-0 bottom-0" />
      <div className="relative z-2 z-10 w-full items-center justify-center lg:flex mb-6">
        <h1 className="font-bold font-mono text-4xl mt-20 sm:mt-0 text-center w-full">
          Ad Metric Data Generator
        </h1>
      </div>

      <div className="mt-9 w-full">
        <div className="w-full">
          <DataForm
            handleSetCampaign={handleSetCampaign}
            isProcessing={isProcessing}
            handleSetIsProcessing={setIsProcessing}
          />
          <sub className="text-center block">
            *To be implemented at a later date
          </sub>
        </div>
      </div>

      {tableData && campaign && (
        <div className="mt-9 px-9 w-full">
          <hr />
          <div className="flex mt-9 mb-4 items-center">
            <h2 className=" font-bold text-2xl">Campaign Report</h2>
            <button
              onClick={handleDownloadCSV}
              className="ml-3 flex items-center hover:text-rose-500"
            >
              <GoDownload />
              Download CSV
            </button>
          </div>
          <div className="flex flex-col md:flex-row justify-between my-4">
            <h2 className="text-lg">Campaign name: {campaign.name}</h2>|
            <h2 className="text-lg">
              Start date: {formatDate(campaign.startDate)}
            </h2>
            |
            <h2 className="text-lg">
              End date: {formatDate(campaign.endDate)}
            </h2>
            |
            <h2 className="text-lg">CTR: {(campaign.ctr * 100).toFixed(2)}%</h2>
            |<h2 className="text-lg">CPM: ${campaign.cpm}</h2>
          </div>
          <div className="mt-9 mb-4">
            <BoldUppercase>Table truncated to 100 rows</BoldUppercase>
          </div>
          <div className="ag-theme-quartz-dark" style={{ width: "100%" }}>
            <AgGridReact
              rowData={tableData.data}
              columnDefs={tableData.columns}
              defaultColDef={{
                resizable: false,
                sortable: true,
                filter: false,
              }}
              domLayout="autoHeight"
            />
          </div>
        </div>
      )}
    </main>
  );
}
