import { ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';

import { Field, Methods } from '@app/model';
import { APIService } from '@app/services';
import { BoardService } from '../services/board.service';
import { DatasourceService } from './datasource-info.service';
import { FilterService } from '../board/services/filter.service';
// Test data
import * as alarmsDatasourceInfoBody from '../../test-response/alarmsDatasourceInfoBody.json';
import * as alarmsBoardBody from '../../test-response/alarmsBoardBody.json';
import * as rebootsDatasourceInfoBody from '../../test-response/rebootsDatasourceInfoBody.json';
import * as rebootsBoardBody from '../../test-response/rebootsBoardBody.json';
import * as interfacesDatasourceInfoBody from '../../test-response/interfacesDatasourceInfoBody.json';
import * as interfacesBoardBody from '../../test-response/interfacesBoardBody.json';

describe('Service: DatasourceService for alarms', () => {
    let injector: TestBed;
    let httpMock: HttpTestingController;
    //
    let api: APIService;
    let service: DatasourceService;
    let filterService: FilterService;
    let fields: Field[];

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                BoardService,
                {
                    provide: DatasourceService,
                    useFactory: (api, resolver, filter) => new DatasourceService(api, resolver, filter),
                    deps: [APIService, BoardService]
                },
                {
                    provide: APIService,
                    useFactory: (backend) => new APIService(backend),
                    deps: [HttpClient]
                }
            ]
        });

        injector = getTestBed();
        api = injector.get(APIService);
        httpMock = injector.get(HttpTestingController);

        // Returns a services with the MockBackend so we can test with dummy responses
        let resolver = TestBed.get(BoardService);
        let route = new ActivatedRouteSnapshot();
        route.params = {id: ''};
        resolver.resolve(route, null);
        filterService = TestBed.get(FilterService);
        service = TestBed.get(DatasourceService);
        // Perform a request and make sure we get the response we expect
        service.fields().subscribe(data =>
            fields = data
        );

        // When the request subscribes for results on a connection, return a fake response
        const dashboardReq = httpMock.expectOne('/api/bi/');
        expect(dashboardReq.request.body.method).toBe(Methods.GET_DASHBOARD);
        dashboardReq.flush(alarmsBoardBody);
        const infoReq = httpMock.expectOne('/api/bi/');
        expect(infoReq.request.body.method).toBe(Methods.GET_DATASOURCE_INFO);
        infoReq.flush(alarmsDatasourceInfoBody);
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
    let injector: TestBed;
    let httpMock: HttpTestingController;
    //
    let api: APIService;
    let service: DatasourceService;
    let filterService: FilterService;
    let fields: Field[];

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                BoardService,
                {
                    provide: DatasourceService,
                    useFactory: (api, resolver, filter) => new DatasourceService(api, resolver, filter),
                    deps: [APIService, BoardService]
                },
                {
                    provide: APIService,
                    useFactory: (backend) => new APIService(backend),
                    deps: [HttpClient]
                }
            ]
        });

        injector = getTestBed();
        api = injector.get(APIService);
        httpMock = injector.get(HttpTestingController);

        // Returns a services with the MockBackend so we can test with dummy responses
        let resolver = TestBed.get(BoardService);
        let route = new ActivatedRouteSnapshot();
        route.params = {id: ''};
        resolver.resolve(route, null);
        filterService = TestBed.get(FilterService);
        service = TestBed.get(DatasourceService);
        // Perform a request and make sure we get the response we expect
        service.fields().subscribe(data =>
            fields = data
        );

        // When the request subscribes for results on a connection, return a fake response
        const dashboardReq = httpMock.expectOne('/api/bi/');
        expect(dashboardReq.request.body.method).toBe(Methods.GET_DASHBOARD);
        dashboardReq.flush(rebootsBoardBody);
        const infoReq = httpMock.expectOne('/api/bi/');
        expect(infoReq.request.body.method).toBe(Methods.GET_DATASOURCE_INFO);
        infoReq.flush(rebootsDatasourceInfoBody);
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
    let injector: TestBed;
    let httpMock: HttpTestingController;
    //
    let api: APIService;
    let service: DatasourceService;
    let filterService: FilterService;
    let fields: Field[];

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                BoardService,
                {
                    provide: DatasourceService,
                    useFactory: (api, resolver, filter) => new DatasourceService(api, resolver, filter),
                    deps: [APIService, BoardService]
                },
                {
                    provide: APIService,
                    useFactory: (backend) => new APIService(backend),
                    deps: [HttpClient]
                }
            ]
        });

        injector = getTestBed();
        api = injector.get(APIService);
        httpMock = injector.get(HttpTestingController);

        // Returns a services with the MockBackend so we can test with dummy responses
        let resolver = TestBed.get(BoardService);
        let route = new ActivatedRouteSnapshot();
        route.params = {id: ''};
        resolver.resolve(route, null);
        filterService = TestBed.get(FilterService);
        service = TestBed.get(DatasourceService);
        // Perform a request and make sure we get the response we expect
        service.fields().subscribe(data =>
            fields = data
        );

        // When the request subscribes for results on a connection, return a fake response
        const dashboardReq = httpMock.expectOne('/api/bi/');
        expect(dashboardReq.request.body.method).toBe(Methods.GET_DASHBOARD);
        dashboardReq.flush(interfacesBoardBody);
        const infoReq = httpMock.expectOne('/api/bi/');
        expect(infoReq.request.body.method).toBe(Methods.GET_DATASOURCE_INFO);
        infoReq.flush(interfacesDatasourceInfoBody);
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
