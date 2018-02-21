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

    static dateToTimeString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%H:%M';

        return d3.time.format(format)(date);
    };

    static dateToDateTimeString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%d.%m.%y %H:%M';

        return d3.time.format(format)(date);
    };

    static spanView(id: number): string {
        return `<a href="/api/card/view/span/${id}/" target="_blank" title="open"><ins>${id}</ins></a>`;
    }

    static stringDateTimeToTimeString(date: string): string {
        const time = date.split(' ')[1];
        return `${time.split(':')[0]}:${time.split(':')[1]}`;
    }

    static numberFormat(data) {
        return d3.format('.4f')(parseFloat(data));
    }

    static intFormat(data) {
        const val = parseFloat(data);

        if (val < 1) {
            return d3.format('.4f')(val);
        }
        if (val < 100) {
            return d3.format('.2f')(val);
        }
        return d3.format('.0f')(val);
    }

    // use if property format exist in table query
    static secondsToString(sec) {
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;

        return hours + ':' + d3.format('02d')(minutes) + ':' + d3.format('02d')(seconds);
    };
}
