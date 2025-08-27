import moment from 'moment';

export const TODAY = moment();
export const TODAY_START = TODAY.format('YYYY-MM-DD') + ' 00:00:00';
export const TODAY_END = TODAY.format('YYYY-MM-DD') + ' 23:59:59';
export const TOMORROW = moment().add(1, 'days');
export const YESTERDAY = moment().add(-1, 'days');
export const TWO_WEEKS_AGO = moment().add(-2, 'weeks');
export const ONE_MONTH_AGO = moment().add(-1, 'months');
export const TWO_MONTHS_AGO = moment().add(-2, 'months');
export const SIX_MONTHS_AGO = moment().add(-6, 'months');
export const ONE_MONTH_FROM_NOW = moment().add(1, 'months');
export const START_OF_THIS_MONTH = moment().startOf('months');
export const END_OF_LAST_MONTH = moment().subtract(1, 'months').endOf('month');
export const ONE_YEAR_AGO = moment().add(-1, 'years');
export const MOMENT_DATE_FORMAT_1 = 'YYYY-MM-DD HH:mm:ss';
export const MOMENT_DATE_FORMAT_2 = 'MMMM Do YYYY, h:mm:ss a'; // pretty datetime
export const MOMENT_DATE_FORMAT_3 = 'h:mm A'; // pretty time
export const MOMENT_DATE_FORMAT_4 = 'YYYY-MM-DD';
export const MOMENT_DATE_FORMAT_5 = 'HH:mm:ss';
