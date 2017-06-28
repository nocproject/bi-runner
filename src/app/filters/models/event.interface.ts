export interface Event {
    type: EventType;
    group?: number;
    filter?: number;
    name?: string;
    value?: any;
}

export enum EventType {
    DeleteFilter,
    DeleteGroup,
    AddFilter,
    ChangeSelect
}
