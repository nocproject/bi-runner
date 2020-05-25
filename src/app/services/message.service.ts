import { Injectable } from '@angular/core';

import { Observable ,  BehaviorSubject } from 'rxjs';
import { cloneDeep, remove } from 'lodash';

import { Message } from '../model';

@Injectable()
export class MessageService {
    private messagesSubject = new BehaviorSubject<Message[]>([]);
    messages$: Observable<Message[]> = this.messagesSubject.asObservable();

    message(...messages: Message[]) {
        this.messagesSubject.next(this.messagesSubject.getValue().concat(messages));
    }

    removeMessage(message: Message) {
        const messages = cloneDeep(this.messagesSubject.getValue());

        remove(messages, e => e.id === message.id);
        this.messagesSubject.next(messages);
    }
}
