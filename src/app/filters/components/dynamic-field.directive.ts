import {
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    Input,
    OnChanges,
    OnInit,
    Type,
    ViewContainerRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FormButtonComponent } from './form-button/form-button.component';
import { FormCalendarComponent } from './form-calendar/form-calendar.component';
import { FormDateRangeComponent } from './form-date-range/form-date-range.component';
import { FormDictionaryComponent } from './form-dictionary/form-dictionary.component';
import { FormInputComponent } from './form-input/form-input.component';
import { FormSelectComponent } from './form-select/form-select.component';
import { FormTreeComponent } from './form-tree/form-tree.component';
import { FormModelComponent } from './form-model/form-model.component';

import { FilterControl } from '../models/field.interface';
import { FieldConfig } from '../models/form-config.interface';

const components: { [type: string]: Type<FilterControl> } = {
    button: FormButtonComponent,
    calendar: FormCalendarComponent,
    dateRange: FormDateRangeComponent,
    dictionary: FormDictionaryComponent,
    input: FormInputComponent,
    select: FormSelectComponent,
    tree: FormTreeComponent,
    model: FormModelComponent
};

@Directive({
    selector: '[biDynamicField]'
})
export class DynamicFieldDirective implements FilterControl, OnChanges, OnInit {
    @Input()
    config: FieldConfig;

    @Input()
    form: FormGroup;

    component: ComponentRef<FilterControl>;

    constructor(private resolver: ComponentFactoryResolver,
                private container: ViewContainerRef) {
    }

    ngOnChanges() {
        if (this.component) {
            this.component.instance.config = this.config;
        }
    }

    ngOnInit() {
        if (this.config) {
            if (!components[this.config.type]) {
                const supportedTypes = Object.keys(components).join(', ');
                throw new Error(
                    `Trying to use an unsupported type (${this.config.type}).
        Supported types: ${supportedTypes}`
                );
            }
            const component = this.resolver.resolveComponentFactory<FilterControl>(components[this.config.type]);
            this.component = this.container.createComponent(component);
            this.component.instance.config = this.config;
            this.component.instance.form = this.form;
        }
    }
}
