import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NgxErrorsModule } from '@ultimate/ngxerrors';
import { TranslateModule } from '@ngx-translate/core';
import { TreeviewModule } from 'ngx-treeview';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { GroupComponent } from './containers/group/group.component';
import { FilterComponent } from './containers/filter/filter.component';
import { FilterFormComponent } from './containers/form/filter-form.component';
import {
    FormButtonComponent, FormCalendarComponent, FormDateRangeComponent, FormDictionaryComponent,
    FormInputComponent, FormModelComponent, FormSelectComponent
} from './components';
import { FormDropdownComponent } from './components/dropdown.component';

import { DynamicFieldDirective } from './components/dynamic-field.directive';
import { DictDirective } from './components/dict.directive';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgxErrorsModule,
        TooltipModule,
        TreeviewModule.forRoot(),
        TranslateModule
    ],
    declarations: [
        DynamicFieldDirective,
        DictDirective,
        FilterComponent,
        FilterFormComponent,
        FormButtonComponent,
        FormInputComponent,
        FormModelComponent,
        FormDropdownComponent,
        FormSelectComponent,
        GroupComponent,
        FormDictionaryComponent,
        FormCalendarComponent,
        FormDateRangeComponent
    ],
    exports: [
        FilterFormComponent
    ],
    entryComponents: [
        GroupComponent,
        FormButtonComponent,
        FormCalendarComponent,
        FormDateRangeComponent,
        FormModelComponent,
        FormDictionaryComponent,
        FormInputComponent,
        FormSelectComponent
    ]
})
export class FiltersModule {
}
