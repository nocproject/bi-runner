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

import { Field } from '../models/field.interface';
import { FieldConfig } from '../models/form-config.interface';
import { FormInputMaskComponent } from './form-input-mask/form-input-mask.component';

const components: { [type: string]: Type<Field> } = {
    button: FormButtonComponent,
    calendar: FormCalendarComponent,
    dateRange: FormDateRangeComponent,
    dictionary: FormDictionaryComponent,
    input: FormInputComponent,
    inputMask: FormInputMaskComponent,
    select: FormSelectComponent
};

@Directive({
    selector: '[biDynamicField]'
})
export class DynamicFieldDirective implements Field, OnChanges, OnInit {
    @Input()
    config: FieldConfig;

    @Input()
    form: FormGroup;

    component: ComponentRef<Field>;

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
            const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
            this.component = this.container.createComponent(component);
            this.component.instance.config = this.config;
            this.component.instance.form = this.form;
        }
    }
}
