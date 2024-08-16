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

export const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${addLeadingZero(date.getMonth() + 1)}-${addLeadingZero(date.getDate())}`;
}
// need at least 5 days for a trend
export const minimumTrendDays = 5;