import { Field, FieldBuilder, Filter, FilterBuilder, Value } from '@app/model';

export const field: any = {
    'isSelectable': true,
    'isGrouping': true,
    'grouped': false,
    'isAgg': false,
    'name': 'ts',
    'description': 'Created',
    'type': 'DateTime',
    'group': 0
};

export const fieldDeserialize: Field =
    new FieldBuilder()
        .name('ts')
        .description('Created')
        .type('DateTime')
        .group(0)
        .build();

export const dateFilter = {
    'association': '$and',
    'name': 'ts',
    'condition': '$lt',
    'field': field,
    'values': [
        {
            'value': '2019-05-31T21:00:00.000Z'
        }
    ]
};

export const dateFilterDeserialize: Filter =
    new FilterBuilder()
        .association('$and')
        .name('ts')
        .condition('$lt')
        .field(fieldDeserialize)
        .values([new Value(new Date('2019-05-31T21:00:00.000Z'))])
        .build();

export const dateInterval = {
    'values': [{'value': 'ly'}],
    'condition': 'interval',
    'name': 'ts',
    'association': '$and',
    'field': {
        'type': 'DateTime'
    }
};

export const dateIntervalValues = {
    'values': [{value: '2018-12-31T21:00:00.000Z'}, {value: '2019-04-30T21:00:00.000Z'}],
    'condition': 'interval',
    'name': 'ts',
    'association': '$and',
    'field': {
        'type': 'DateTime'
    }
};

export const dateIntervalDeserialize: Filter =
    new FilterBuilder()
        .condition('interval')
        .name('ts')
        .association('$and')
        .field(
            new FieldBuilder()
                .type('DateTime')
                .build())
        .values([new Value('ly')])
        .build();

export const dateIntervalValuesDeserialize: Filter =
    new FilterBuilder()
        .condition('interval')
        .name('ts')
        .association('$and')
        .field(
            new FieldBuilder()
                .type('DateTime')
                .build())
        .values([new Value(new Date('2018-12-31T21:00:00.000Z')), new Value(new Date('2019-04-30T21:00:00.000Z'))])
        .build();

export const datePeriodic = {
    'values': [{'value': '10:00 - 12:00'}],
    'condition': 'periodic.interval',
    'name': 'ts',
    'association': '$and',
    'field': {
        'type': 'DateTime'
    }
};

export const datePeriodicDeserialize: Filter =
    new FilterBuilder()
        .condition('periodic.interval')
        .name('ts')
        .association('$and')
        .field(
            new FieldBuilder()
                .type('DateTime')
                .build())
        .values([new Value('10:00 - 12:00')])
        .build();
