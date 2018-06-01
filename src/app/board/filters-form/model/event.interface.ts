export interface Event {
    type: EventType;
    group?: number;
    filter?: number;
    name?: string;
    payload?: any;
}

export enum EventType {
    AddFilter,
    AddGroup,
    DeleteFilter,
    DeleteGroup,
    Restore,
    AddBoxplotGroup
}
