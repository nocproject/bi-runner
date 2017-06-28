import { Methods } from './methods.enum';

export class Method {
    constructor(private method: Methods,
                private id: number = 0,
                private params?: [any]) {
    }
}
