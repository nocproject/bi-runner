import { Group } from 'app/model';

export interface FormData {
    groups: Groups[];
}

export interface Groups {
    association: '$and' | '$or';
    active: boolean;
    group: Group;
}
