import * as d3 from 'd3';

export class Utils {

    static reductionName(element): string {
        const name = element.desc;

        if (name && name.length > 10) {
            return name.substr(0, 10) + '...';
        }
        return name;
    };

    // use if property format exist in table query
    static dateToString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%d.%m.%y';

        return d3.time.format(format)(date);
    };

    // use if property format exist in table query
    static secondsToString(sec) {
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;

        return hours + ':' + d3.format('02d')(minutes) + ':' + d3.format('02d')(seconds);
    };
}
