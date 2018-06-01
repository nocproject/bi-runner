import { Field } from '@app/model';
import { FormGroup } from '@angular/forms';
import { Input, OnInit } from '@angular/core';

import { FieldConfig } from '../model/filters-form-config.interface';

export class ValueControl  implements OnInit {
    @Input()
    config: FieldConfig;
    @Input()
    form: FormGroup;
    @Input()
    field: Field;

    ngOnInit(): void {
        this.initControl();
    }

    initControl(): void {
        if (this.config.disabled) {
            this.form.get(this.config.controlName).disable();
        }
        this.form.get(this.config.controlName).setValidators(this.config.validation);
    }
}
