import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
//
import { TranslateModule } from '@ngx-translate/core';
//
import { DataGridModule } from '../shared/data-grid/data-grid.module';
import { ModalModule } from '../shared/modal/modal.module';
//
//
import { ShareComponent } from './share.component';

@NgModule({
    imports: [
        CommonModule,
        DataGridModule,
        ReactiveFormsModule,
        ModalModule,
        TranslateModule
    ],
    declarations: [ShareComponent],
    exports: [ShareComponent]
})
export class ShareModule {
}
