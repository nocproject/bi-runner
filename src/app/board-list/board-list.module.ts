import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { BoardListComponent } from './board-list.component';
import { DataGridModule } from '../shared/data-grid/data-grid.module';

@NgModule({
    imports: [
        CommonModule,
        DataGridModule,
        TranslateModule
    ],
    declarations: [
        BoardListComponent
    ]
})
export class BoardListModule {
}
