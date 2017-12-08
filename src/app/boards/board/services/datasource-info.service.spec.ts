import { BaseRequestOptions, Response, ResponseOptions } from '@angular/http';

import { TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';

import { Http, InterceptorStore } from '../../../shared/interceptor/service';
import { APIService } from '../../../services';
import { BoardResolver } from './board.resolver';
import { DatasourceService } from './datasource-info.service';
import { Field, Methods } from '../../../model';
// Test data
import * as alarmsDatasourceInfoBody from '../../../test-response/alarmsDatasourceInfoBody.json';
import * as alarmsBoardBody from '../../../test-response/alarmsBoardBody.json';
import * as rebootsDatasourceInfoBody from '../../../test-response/rebootsDatasourceInfoBody.json';
import * as rebootsBoardBody from '../../../test-response/rebootsBoardBody.json';
import * as interfacesDatasourceInfoBody from '../../../test-response/interfacesDatasourceInfoBody.json';
import * as interfacesBoardBody from '../../../test-response/interfacesBoardBody.json';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('Service: DatasourceService for alarms', () => {
    let service: DatasourceService;
    let backend: MockBackend;
    let fields: Field[];

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                InterceptorStore,
                MockBackend,
                BaseRequestOptions,
                BoardResolver,
                {
                    provide: DatasourceService,
                    useFactory: (api, resolver) => new DatasourceService(api, resolver),
                    deps: [APIService, BoardResolver]
                },
                {
                    provide: APIService,
                    useFactory: (backend) => new APIService(backend),
                    deps: [Http]
                },
                {
                    provide: Http,
                    useFactory: (backend, options, interceptor) => new Http(backend, options, interceptor),
                    deps: [MockBackend, BaseRequestOptions, InterceptorStore]
                }
            ]
        });

        // Get the MockBackend
        backend = TestBed.get(MockBackend);

        // Returns a services with the MockBackend so we can test with dummy responses
        let resolver = TestBed.get(BoardResolver);
        let route = new ActivatedRouteSnapshot();
        route.params = {id: ''};
        resolver.resolve(route, null);
        service = TestBed.get(DatasourceService);

        // When the request subscribes for results on a connection, return a fake response
        backend.connections.subscribe(connection => {
            let method = JSON.parse(connection.request.getBody()).method;
            switch (method) {
                case Methods.GET_DATASOURCE_INFO:
                    connection.mockRespond(new Response(<ResponseOptions>{
                        body: JSON.stringify(alarmsDatasourceInfoBody)
                    }));
                    break;
                case Methods.GET_DASHBOARD:
                    connection.mockRespond(new Response(<ResponseOptions>{
                        body: JSON.stringify(alarmsBoardBody)
                    }));
                    break;
            }
        });

        // Perform a request and make sure we get the response we expect
        service.fields().subscribe(data =>
            fields = data
        );
    });

    it('should return field list for group by element', () => {
        expect(fields.length).toBe(30);
    });

    it('check dict fields', () => {
        expect(fields.filter(f => f.dict).length).toBe(10);
    });

    it('check selectable fields', () => {
        expect(fields.filter(f => f.isSelectable).length).toBe(29);
    });

    it('check group #0', () => {
        expect(fields.filter(f => f.group === 0).length).toBe(18);
    });

    it('check group #1', () => {
        expect(fields.filter(f => f.group === 1).length).toBe(9);
    });

    it('check group #2', () => {
        expect(fields.filter(f => f.group === 2).length).toBe(2);
    });

    it('check group #3', () => {
        expect(fields.filter(f => f.group === 3).length).toBe(0);
    });

    it('check group #999', () => {
        expect(fields.filter(f => f.group === 999).length).toBe(1);
    });

    it('check tree-administrativedomain field', () => {
        expect(fields.filter(f => f.dict === 'administrativedomain')[0].type).toBe('tree-administrativedomain');
    });

    it('check dict- fields', () => {
        expect(fields.filter(f => f.type.startsWith('dict-')).length).toBe(9);
    });

    it('check datasource fields', () => {
        expect(fields.filter(f => f.datasource === 'alarms').length).toBe(10);
    });

    it('check model- fields', () => {
        expect(fields.filter(f => f.type.startsWith('model-')).length).toBe(0);
    });

    it('check type ip field', () => {
        expect(fields.filter(f => f.name === 'ip')[0].type).toBe('IPv4');
    });

    it('check grouping fields', () => {
        expect(fields.filter(f => f.isGrouping).length).toBe(24);
    });

    it('check pseudo fields', () => {
        expect(fields.filter(f => f.pseudo).length).toBe(1);
    });
});

describe('Service: DatasourceService for reboots', () => {
    let service: DatasourceService;
    let backend: MockBackend;
    let fields: Field[];

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                InterceptorStore,
                MockBackend,
                BaseRequestOptions,
                BoardResolver,
                {
                    provide: DatasourceService,
                    useFactory: (api, resolver) => new DatasourceService(api, resolver),
                    deps: [APIService, BoardResolver]
                },
                {
                    provide: APIService,
                    useFactory: (backend) => new APIService(backend),
                    deps: [Http]
                },
                {
                    provide: Http,
                    useFactory: (backend, options, interceptor) => new Http(backend, options, interceptor),
                    deps: [MockBackend, BaseRequestOptions, InterceptorStore]
                }
            ]
        });

        // Get the MockBackend
        backend = TestBed.get(MockBackend);

        // Returns a services with the MockBackend so we can test with dummy responses
        let resolver = TestBed.get(BoardResolver);
        let route = new ActivatedRouteSnapshot();
        route.params = {id: ''};
        resolver.resolve(route, null);
        service = TestBed.get(DatasourceService);

        // When the request subscribes for results on a connection, return a fake response
        backend.connections.subscribe(connection => {
            let method = JSON.parse(connection.request.getBody()).method;
            switch (method) {
                case Methods.GET_DATASOURCE_INFO:
                    connection.mockRespond(new Response(<ResponseOptions>{
                        body: JSON.stringify(rebootsDatasourceInfoBody)
                    }));
                    break;
                case Methods.GET_DASHBOARD:
                    connection.mockRespond(new Response(<ResponseOptions>{
                        body: JSON.stringify(rebootsBoardBody)
                    }));
                    break;
            }
        });

        // Perform a request and make sure we get the response we expect
        service.fields().subscribe(data =>
            fields = data
        );
    });

    it('should return field list for group by element', () => {
        expect(fields.length).toBe(14);
    });

    it('check dict fields', () => {
        expect(fields.filter(f => f.dict).length).toBe(9);
    });

    it('check selectable fields', () => {
        expect(fields.filter(f => f.isSelectable).length).toBe(14);
    });

    it('check group #0', () => {
        expect(fields.filter(f => f.group === 0).length).toBe(2);
    });

    it('check group #1', () => {
        expect(fields.filter(f => f.group === 1).length).toBe(8);
    });

    it('check group #2', () => {
        expect(fields.filter(f => f.group === 2).length).toBe(2);
    });

    it('check group #3', () => {
        expect(fields.filter(f => f.group === 3).length).toBe(2);
    });

    it('check group #999', () => {
        expect(fields.filter(f => f.group === 999).length).toBe(0);
    });

    it('check tree-administrativedomain field', () => {
        expect(fields.filter(f => f.dict === 'administrativedomain')[0].type).toBe('tree-administrativedomain');
    });

    it('check dict- fields', () => {
        expect(fields.filter(f => f.type.startsWith('dict-')).length).toBe(8);
    });

    it('check datasource fields', () => {
        expect(fields.filter(f => f.datasource === 'reboots').length).toBe(9);
    });

    it('check model- fields', () => {
        expect(fields.filter(f => f.type.startsWith('model-')).length).toBe(0);
    });

    it('check type ip field', () => {
        expect(fields.filter(f => f.name === 'ip')[0].type).toBe('IPv4');
    });

    it('check grouping fields', () => {
        expect(fields.filter(f => f.isGrouping).length).toBe(12);
    });

    it('check pseudo fields', () => {
        expect(fields.filter(f => f.pseudo).length).toBe(0);
    });
});

describe('Service: DatasourceService for interfaces', () => {
    let service: DatasourceService;
    let backend: MockBackend;
    let fields: Field[];

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                InterceptorStore,
                MockBackend,
                BaseRequestOptions,
                BoardResolver,
                {
                    provide: DatasourceService,
                    useFactory: (api, resolver) => new DatasourceService(api, resolver),
                    deps: [APIService, BoardResolver]
                },
                {
                    provide: APIService,
                    useFactory: (backend) => new APIService(backend),
                    deps: [Http]
                },
                {
                    provide: Http,
                    useFactory: (backend, options, interceptor) => new Http(backend, options, interceptor),
                    deps: [MockBackend, BaseRequestOptions, InterceptorStore]
                }
            ]
        });

        // Get the MockBackend
        backend = TestBed.get(MockBackend);

        // Returns a services with the MockBackend so we can test with dummy responses
        let resolver = TestBed.get(BoardResolver);
        let route = new ActivatedRouteSnapshot();
        route.params = {id: ''};
        resolver.resolve(route, null);
        service = TestBed.get(DatasourceService);

        // When the request subscribes for results on a connection, return a fake response
        backend.connections.subscribe(connection => {
            let method = JSON.parse(connection.request.getBody()).method;
            switch (method) {
                case Methods.GET_DATASOURCE_INFO:
                    connection.mockRespond(new Response(<ResponseOptions>{
                        body: JSON.stringify(interfacesDatasourceInfoBody)
                    }));
                    break;
                case Methods.GET_DASHBOARD:
                    connection.mockRespond(new Response(<ResponseOptions>{
                        body: JSON.stringify(interfacesBoardBody)
                    }));
                    break;
            }
        });

        // Perform a request and make sure we get the response we expect
        service.fields().subscribe(data =>
            fields = data
        );
    });

    it('should return field list for group by element', () => {
        expect(fields.length).toBe(33);
    });

    it('check dict fields', () => {
        expect(fields.filter(f => f.dict).length).toBe(6);
    });

    it('check selectable fields', () => {
        expect(fields.filter(f => f.isSelectable).length).toBe(14);
    });

    it('check group #0', () => {
        expect(fields.filter(f => f.group === 0).length).toBe(4);
    });

    it('check group #1', () => {
        expect(fields.filter(f => f.group === 1).length).toBe(2);
    });

    it('check group #2', () => {
        expect(fields.filter(f => f.group === 2).length).toBe(2);
    });

    it('check group #3', () => {
        expect(fields.filter(f => f.group === 3).length).toBe(4);
    });

    it('check group #999', () => {
        expect(fields.filter(f => f.group === 999).length).toBe(19);
    });

    it('check tree-administrativedomain field', () => {
        expect(fields.filter(f => f.dict === 'administrativedomain')[0]).toBeUndefined();
    });

    it('check dict- fields', () => {
        expect(fields.filter(f => f.type.startsWith('dict-')).length).toBe(0);
    });

    it('check datasource fields', () => {
        expect(fields.filter(f => f.datasource === 'interface').length).toBe(6);
    });

    it('check model- fields', () => {
        expect(fields.filter(f => f.type.startsWith('model-')).length).toBe(6);
    });

    it('check type ip field', () => {
        expect(fields.filter(f => f.name === 'ip')[0]).toBeUndefined();
    });

    it('check grouping fields', () => {
        expect(fields.filter(f => f.isGrouping).length).toBe(14);
    });

    it('check pseudo fields', () => {
        expect(fields.filter(f => f.pseudo).length).toBe(0);
    });
});
