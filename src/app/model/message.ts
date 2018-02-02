import { uniqueId } from 'lodash';

import { MessageType } from './message-type.enum';

export class Message {
    public id: string;

    constructor(public type: MessageType, public text: string) {
        this.id = uniqueId();
    }
}
