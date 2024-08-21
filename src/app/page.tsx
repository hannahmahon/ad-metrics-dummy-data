"use client";
import React, { useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { GoDownload } from "react-icons/go";
import { DataForm } from "./components/formComponents/DataForm";
import { BoldUppercase } from "./components/BoldUppercase";
import { formatField } from "./utils";
import { GoChevronRight, GoChevronDown } from "react-icons/go";
import { CampaignResultData } from "../../types";

const campaignMetricsHeaders: {
  headerName: string;
  field: "startDate" | "endDate" | "ctr" | "cpm" | "aov" | "atcRate" | "cac";
}[] = [
  { headerName: "Start date", field: "startDate" },
  { headerName: "End date", field: "endDate" },
  { headerName: "CPM", field: "cpm" },
  { headerName: "CTR", field: "ctr" },
  { headerName: "CAC", field: "cac" },
  { headerName: "AOV", field: "aov" },
  { headerName: "ATC Rate", field: "atcRate" },
];

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [campaignsData, setCampaignsData] = useState<
    (CampaignResultData & { isExpanded: boolean })[] | null
  >(null);
  const csvName = useRef<string | null>(null);

  const handleDownloadCSV = async () => {
    if (!csvName.current) return;
    const response = await fetch(`/api/csv/${csvName.current}`);
    if (response.ok) {
      const blob = await response.blob();
      console.log(blob)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${csvName.current}`; // The filename provided here is what will be used for the downloaded file
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
       setIsProcessing(true);

      const { campaignData, csvName: newCsvName } = await fetch(
        `/api/generate`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(values),
        }
      )
        .then((r) => r.json())
        .catch((e) => {
          console.error(e);

          return { campaignData: null, csvName: null };
        });
      setCampaignsData(
        campaignData.map((c: CampaignResultData, i: number) => ({
          ...c,
          isExpanded: i === 0 && campaignData.length === 1,
        }))
      );
      csvName.current = newCsvName;
      setIsProcessing(false);
    } catch (e) {
      setIsProcessing(false);
    }
  };

  const handleToggleExpanded = (name: string) => () => {
    setCampaignsData((prev) => {
      if (!prev) return prev;
      return prev.map((campaign) => {
        if (campaign.name === name) {
          return { ...campaign, isExpanded: !campaign.isExpanded };
        }
        return campaign;
      });
    });
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
          <DataForm handleSubmit={handleSubmit} isProcessing={isProcessing} />
          {/* <sub className="text-center block">
            *To be implemented at a later date
          </sub> */}
        </div>
      </div>
      {campaignsData?.length && (
        <div className="mt-9 px-9 w-full">
          <hr />
          <div>
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
            <p className="mb-4">
              <em>
                CSVs will be available to download for up to 24 hours after
                form submission. Afterwards, they will be deleted.
              </em>
            </p>
          </div>
          {campaignsData.map((campaign) => {
            const Icon = campaign.isExpanded ? GoChevronDown : GoChevronRight;
            return (
              <div
                key={campaign.name}
                className="rounded-lg border border-transparent p-6 transition-colors hover:border-gray-500 hover:bg-gray-100 hover:bg-opacity-5 "
              >
                <button
                  onClick={handleToggleExpanded(campaign.name)}
                  className="flex items-center md:flex-row  mb-4"
                >
                  <Icon className="text-lg mr-2" />
                  <h2 className="text-lg font-bold">{campaign.name}</h2>
                </button>
                <div className="ag-theme-custom" style={{ width: "100%" }}>
                  <AgGridReact
                    rowData={[
                      campaignMetricsHeaders.reduce((acc, { field }) => {
                        if (typeof campaign[field] === "undefined") return acc;
                        return {
                          ...acc,
                          [field]: formatField(
                            field,
                            campaign[field] as number
                          ),
                        };
                      }, {}),
                    ]}
                    // @ts-ignore
                    columnDefs={campaignMetricsHeaders}
                    defaultColDef={{
                      resizable: false,
                      sortable: true,
                      filter: false,
                    }}
                    rowHeight={50}
                    headerHeight={50}
                    rowClass={`transition-colors hover:bg-gray-100 hover:bg-opacity-10`}
                    domLayout="autoHeight"
                  />
                </div>
                {campaign.isExpanded && (
                  <>
                    <div className="mt-9 mb-4">
                      <BoldUppercase>
                        Ad data truncated to 25 rows
                      </BoldUppercase>
                    </div>
                    <div className="ag-theme-custom" style={{ width: "100%" }}>
                      <AgGridReact
                        rowData={campaign.data.data.map((obj) => {
                          const newObj: Record<string, string> = {};
                          Object.entries(obj).forEach(([key, val]) => {
                            newObj[key] = formatField(key, val);
                          });
                          return newObj;
                        })}
                        columnDefs={campaign.data.columns}
                        defaultColDef={{
                          resizable: false,
                          sortable: true,
                          filter: false,
                        }}
                        rowHeight={50}
                        headerHeight={50}
                        rowClass={`transition-colors hover:bg-gray-100 hover:bg-opacity-10`}
                        domLayout="autoHeight"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
