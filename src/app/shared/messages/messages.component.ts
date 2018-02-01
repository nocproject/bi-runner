import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { MessageService } from '@app/services/index';
import { Message } from '@app/model/index';

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
}
