import { FormGroup } from '@angular/forms';

import { FieldConfig } from '@filter/model';

export interface FilterControl {
    config: FieldConfig;
    form: FormGroup;
}
