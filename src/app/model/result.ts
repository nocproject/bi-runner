export class Result {

    static fromJSON(json: Object): Result {
        return new Result(
            json['id'],
            json['error'],
            json['result']
        );
    }

    constructor(private id?: number,
                private error?: string,
                public result?: any) {
    }

    get data(): any {
        return this.result;
    }

    set data(value: any) {
        this.result = value;
    }

    zip(dateParse: boolean) {
        const array = [];

        for (const row of this.data['result']) {
            const record = {};
            for (let index = 0; index < this.data['fields'].length; index++) {
                if (dateParse && this.data['fields'][index] === 'date') {
                    record['date'] = new Date(Date.parse(row[index]));
                } else {
                    record[this.data['fields'][index]] = row[index];
                }
            }
            array.push(record);
        }
        return array;
    };
}
