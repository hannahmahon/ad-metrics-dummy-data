import { MinMaxRange } from "../../types";

export const dayInMs = 1000 * 60 * 60 * 24;
export function generateRandomNumber([min, max]: MinMaxRange) {
    return Math.random() * (max - min) + min;
};
export function getArrayOfLengthBetween([min, max]: MinMaxRange) {
    const num = Math.floor(generateRandomNumber([max, min]))
    return Array(num).fill("")
}

export const addLeadingZero = (num: number) => num < 10 ? `0${num}` : `${num}`;

export const formatDate = (timestamp: number, format: string = 'yyyy-mm-dd') => {
    const date = new Date(timestamp);
    if (format === 'yyyy-mm-dd') {
        return `${date.getFullYear()}-${addLeadingZero(date.getMonth() + 1)}-${addLeadingZero(date.getDate())}`;
    } else if (format === 'mm/dd/yyyy') {
        return `${addLeadingZero(date.getMonth() + 1)}/${addLeadingZero(date.getDate())}/${date.getFullYear()}`;
    }
    return '';
}
export const minimumTrendDays = 8;


export function parseCurrency(val: number) {
    return parseFloat(val.toFixed(2))
}
export function formatCurrency(val: number) {
    return `$${val.toFixed(2)}`
}
export function formatPercentage(val: number) {
    return `${(val * 100).toFixed(2)}%`
}
export function formatField(field: string, val: string | number) {
    try {
        switch (field) {
            case "cpm":
            case "aov":
            case "cac":
            case "revenue":
                return formatCurrency(val as number)
            case "ctr":
            case "atcRate":
                return formatPercentage(val as number)
            default:
                return `${val}`
        }
    } catch (e) {
        console.log(field, val)
        throw e;
    }
}