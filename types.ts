
export type InputProps = {
    name: string;
    label: string | React.ReactNode;
    defaultValue: string | number;
    disabled?: boolean;
    className?: string;
};
export type MinMaxNumberInputProps = Omit<InputProps, "defaultValue"> & {
    defaultValues: [number, number];
    rangeClassName?: string;
};
export type MinMaxDateInputProps = Omit<InputProps, "defaultValue"> & {
    defaultValues: [string | number, string | number];
};
export type MinMaxRange = number[];
export type TableData = {
    columns: { headerName: string; field: string; }[];
    data: Record<string, string | number>[];
};
export type CampaignArgs = {
    daysInCampaign?: number;
    startDateRange: MinMaxRange;
    endDateRange: MinMaxRange;
    adsetsPerCampaignRange: MinMaxRange;
    adsPerAdsetRange: MinMaxRange;
    spendRange: MinMaxRange;
    cpmRange: MinMaxRange;
    ctrRange: MinMaxRange;
}
