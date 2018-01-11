import { FormGroup } from '@angular/forms';

import { FieldConfig } from './form-config.interface';

export interface FilterControl {
    config: FieldConfig;
    form: FormGroup;
}
