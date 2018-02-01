export interface Event {
    type: EventType;
    group?: number;
    filter?: number;
    name?: string;
    value?: any;
}

export enum EventType {
    AddFilter,
    ChangeSelect,
    DeleteFilter,
    DeleteGroup,
    FilterChanged,
    Restore
}
