import * as _ from 'lodash';

import { MessageType } from './message-type.enum';

export class Message {
    public id: number;

    constructor(public type: MessageType, public text: string) {
        this.id = _.uniqueId();
    }
}
