import { Component, Input, OnInit } from '@angular/core';

import { Message } from '../../model/message';
import { MessageService } from '../../services/message.service';

@Component({
    selector: 'bi-message',
    template: `
        <div class="alert {{ message.type }} alert-dismissible message"
             role="alert">
            <button type="button" class="close" aria-label="Close" (click)="close(message)">
                <span>&times;</span>
            </button>
            <div translate>{{message.text}}</div>
        </div>
    `,
    styleUrls: ['./messages.component.scss']
})
export class MessageComponent implements OnInit {
    @Input()
    public message: Message;

    constructor(private messagesService: MessageService) {
    }

    ngOnInit() {
        setTimeout(() => this.messagesService.removeMessage(this.message), 5000);
    }

    close(message: Message) {
        this.messagesService.removeMessage(message);
    }
}
