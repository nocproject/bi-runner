import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';

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

        return timeFormat(format)(date);
    };

    static dateToTimeString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%H:%M';

        return timeFormat(format)(date);
    };

    static dateToDateTimeString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%d.%m.%y %H:%M';

        return timeFormat(format)(date);
    };

    static spanView(id: number): string {
        return `<a href="/api/card/view/span/${id}/" target="_blank" title="open"><ins>${id}</ins></a>`;
    }

    static stringDateTimeToTimeString(date: string): string {
        const time = date.split(' ')[1];
        return `${time.split(':')[0]}:${time.split(':')[1]}`;
    }

    static numberFormat(data) {
        return format('.4f')(parseFloat(data));
    }

    static intFormat(data) {
        const val = parseFloat(data);

        if (val < 1) {
            return format('.4f')(val);
        }
        if (val < 100) {
            return format('.2f')(val);
        }
        return format('.0f')(val);
    }

    // use if property format exist in table query
    static secondsToString(sec): string {
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;

        return `${hours}:${format('02d')(minutes)}:${format('02d')(seconds)}`;
    };

    static intToIP(value): string {
        let bytes = [];

        bytes[0] = value & 0xFF;
        bytes[1] = (value >> 8) & 0xFF;
        bytes[2] = (value >> 16) & 0xFF;
        bytes[3] = (value >> 24) & 0xFF;
        return `${bytes[3]}.${bytes[2]}.${bytes[1]}.${bytes[0]}`;
    }
}
