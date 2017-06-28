import { FormGroup } from '@angular/forms';

import { FieldConfig } from './form-config.interface';

export interface Field {
    config: FieldConfig;
    form: FormGroup;
}
