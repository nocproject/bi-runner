import { Group } from '../../model/group';

export interface FormData {
    groups: Groups[];
}

export interface Groups {
    association: '$and' | '$or';
    active: boolean;
    group: Group;
}
