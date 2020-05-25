import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TreeviewModule } from 'ngx-treeview';

import { GroupComponent } from './group/group.component';
import { FilterComponent } from './filter/filter.component';
import { FiltersFormComponent } from './filters-form.component';
import { SpinnerComponent } from './spinner.component';
import { BiDropdownComponent } from './components/dropdown/dropdown.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { FormDictionaryComponent } from './components/form-dictionary/form-dictionary.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormModelComponent } from './components/form-model/form-model.component';

export const COMPONENTS = [
    GroupComponent,
    FilterComponent,
    FiltersFormComponent,
    SpinnerComponent,
    BiDropdownComponent,
    FormSelectComponent,
    FormDictionaryComponent,
    FormModelComponent,
    FormInputComponent
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TooltipModule,
        TranslateModule,
        TreeviewModule.forRoot()
    ],
    declarations: [
        ...COMPONENTS
    ],
    exports: [
        FiltersFormComponent
    ],
    entryComponents: [
        FormSelectComponent,
        FormDictionaryComponent,
        FormModelComponent,
        FormInputComponent
    ]
})
export class FiltersFormModule {
}
