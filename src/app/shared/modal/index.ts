import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalComponent, ModalHeaderComponent, ModalContentComponent, ModalFooterComponent } from './modal';
import { RouteModalComponent } from './route-modal';

@NgModule({
    imports: [CommonModule],
    declarations: [
        ModalComponent,
        RouteModalComponent,
        ModalHeaderComponent,
        ModalContentComponent,
        ModalFooterComponent
    ],
    exports: [
        ModalComponent,
        RouteModalComponent,
        ModalHeaderComponent,
        ModalContentComponent,
        ModalFooterComponent
    ]
})
export class ModalModule {

}