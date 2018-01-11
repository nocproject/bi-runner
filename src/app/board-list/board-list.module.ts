import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardListComponent } from './board-list.component';
import { DataGridModule } from '../shared/data-grid/data-grid.module';

@NgModule({
    imports: [
        CommonModule,
        DataGridModule
    ],
    declarations: [
        BoardListComponent
    ]
})
export class BoardListModule {
}
