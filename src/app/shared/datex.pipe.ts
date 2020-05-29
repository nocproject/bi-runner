import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
    name: 'datex'
})
export class DatexPipe implements PipeTransform {

    transform(value: any, format: string = ''): string {
        return moment(value).isValid() ? moment(value).format(format) : value;
    }
}
