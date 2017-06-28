import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MessageService } from '../../services';
import { Message } from '../../model';

@Component({
    selector: 'bi-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

    messages$: Observable<Message[]>;

    constructor(private messagesService: MessageService) {
    }

    ngOnInit() {
        this.messages$ = this.messagesService.messages$;
    }

    close(message: Message) {
        this.messagesService.removeMessage(message);
    }
}
