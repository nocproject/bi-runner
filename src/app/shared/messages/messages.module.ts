import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { MessagesComponent } from './messages.component';
import { MessageComponent } from './message.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule
    ],
    declarations: [
        MessageComponent,
        MessagesComponent
    ],
    exports: [
        MessageComponent,
        MessagesComponent
    ]
})
export class MessagesModule {
}
