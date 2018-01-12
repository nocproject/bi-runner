import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

import { Message } from 'app/model';

@Injectable()
export class MessageService {
    private messagesSubject = new BehaviorSubject<Message[]>([]);
    messages$: Observable<Message[]> = this.messagesSubject.asObservable();

    message(...messages: Message[]) {
        this.messagesSubject.next(this.messagesSubject.getValue().concat(messages));
    }

    removeMessage(message: Message) {
        const messages = this.cloneValue(this.messagesSubject);

        _.remove(messages, e => e.id === message.id);
        this.messagesSubject.next(messages);
    }

    private cloneValue(subject: BehaviorSubject<any>) {
        return _.cloneDeep(subject.getValue());
    }
}
