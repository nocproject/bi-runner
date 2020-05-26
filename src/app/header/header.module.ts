import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from '../shared/modal/modal.module';
import { WidgetsModule } from '../board/widgets/widgets.module';
//
import { AccessLevelComponent } from './access-level.component';
import { HeaderComponent } from './header.component';

export const COMPONENTS = [
    AccessLevelComponent,
    HeaderComponent
];

@NgModule({
    imports: [
        AppRoutingModule,
        CommonModule,
        ModalModule,
        ReactiveFormsModule,
        WidgetsModule,
        BsDropdownModule.forRoot(),
        TranslateModule
    ],
    declarations: [
        ...COMPONENTS,
    ],
    exports: [
        ...COMPONENTS
    ]
})
export class HeaderModule {
}
