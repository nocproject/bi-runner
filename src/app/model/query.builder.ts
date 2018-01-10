// import { BiRequest } from './bi-request';
//
// export class BiRequestBuilder {
//     private query: BiRequest = new BiRequest();
//
//     constructor() {
//         this.query.id = 0;
//         this.query.params = [];
//     }
//
//     public id(id: number) {
//         this.query.id = id;
//         return this;
//     }
//
//     public method(method: string): BiRequestBuilder {
//         this.query.method = method;
//         return this;
//     }
//
//     public params(params: any[]): BiRequestBuilder {
//         this.query.params = params;
//         return this;
//     }
//
//     public build(): BiRequest {
//         return this.query;
//     }
// }
