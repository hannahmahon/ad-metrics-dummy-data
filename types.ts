
export interface InputProps {
    name: string;
    label: string | React.ReactNode;
    defaultValue: string | number;
    disabled?: boolean;
    className?: string;
};
export type SelectInputProps = InputProps & {
    options: { name: string; value: string | number }[];
}
export type MinMaxNumberInputProps = Omit<InputProps, "defaultValue"> & {
    defaultValues: [number, number];
    rangeClassName?: string;
};
export type MinMaxDateInputProps = Omit<InputProps, "defaultValue"> & {
    defaultValues: [string | number, string | number];
    rangeClassName?: string;
};
export type MinMaxRange = number[];
export type TableData = {
    columns: { headerName: string; field: string; }[];
    data: Record<string, string | number>[];
};
export type CampaignArgs = {
    daysInCampaign: number;
    startDateRange?: MinMaxRange;
    endDateRange?: MinMaxRange;
    adsetsPerCampaignRange: MinMaxRange;
    adsPerAdsetRange: MinMaxRange;
    spendRange: MinMaxRange;
    cpmRange: MinMaxRange;
    ctrRange: MinMaxRange;
    cacRange: MinMaxRange;
    atcRateRange: MinMaxRange;
    aovRange: MinMaxRange;
}

export type CampaignResultData = {
    name: string;
    startDate: string;
    endDate: string;
    ctr: number;
    cac: number;
    aov: number;
    atcRate: number;
    cpm: number;
    data: TableData;
};
