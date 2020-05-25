import { deserialize } from 'typescript-json-serializer';

import {
    dateFilter,
    dateFilterDeserialize,
    dateInterval,
    dateIntervalDeserialize,
    dateIntervalValues,
    dateIntervalValuesDeserialize,
    datePeriodic,
    datePeriodicDeserialize,
    field,
    fieldDeserialize
} from '../test-response/data/json';
import { Field } from './field';
import { Filter } from './filter';

describe('Deserialize Fields', () => {
    it('Simple Field', () => {
        expect(deserialize<Field>(field, Field)).toEqual(fieldDeserialize);
    });
});

describe('Deserialize Filters', () => {
    it('Date', () => {
        expect(deserialize<Filter>(dateFilter, Filter)).toEqual(dateFilterDeserialize);
    });
    it('Date Interval', () => {
        expect(deserialize<Filter>(dateInterval, Filter)).toEqual(dateIntervalDeserialize);
    });
    it('Date Interval Values', () => {
        expect(deserialize<Filter>(dateIntervalValues, Filter)).toEqual(dateIntervalValuesDeserialize);
    });
    it('Date Periodic', () => {
        expect(deserialize<Filter>(datePeriodic, Filter)).toEqual(datePeriodicDeserialize);
    });
});
