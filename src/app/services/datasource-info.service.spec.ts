import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';

import { Field, Methods } from '../model';
import { APIService } from '../services';
import { BoardService } from './board.service';
import { DatasourceService } from './datasource-info.service';
import { EventService, FilterService } from '@board/services';
// Test data
import * as alarmsDatasourceInfoBody from '@test/alarmsDatasourceInfoBody.json';
import * as alarmsBoardBody from '@test/alarmsBoardBody.json';
import * as rebootsDatasourceInfoBody from '@test/rebootsDatasourceInfoBody.json';
import * as rebootsBoardBody from '@test/rebootsBoardBody.json';
import * as interfacesDatasourceInfoBody from '@test/interfacesDatasourceInfoBody.json';
import * as interfacesBoardBody from '@test/interfacesBoardBody.json';

let fields: Field[];

function init(json, jsonInfo) {
    let injector: TestBed;
    let httpMock: HttpTestingController;

    TestBed.configureTestingModule({
        imports: [
            HttpClientTestingModule
        ],
        providers: [
            APIService,
            BoardService,
            DatasourceService,
            EventService,
            FilterService
        ]
    });

    injector = getTestBed();
    httpMock = injector.inject(HttpTestingController);

    // Returns a services with the MockBackend so we can test with dummy responses
    let boardService = TestBed.inject(BoardService);
    boardService.getById('1').subscribe();
    const dashboardReq = httpMock.expectOne('/api/bi/');
    expect(dashboardReq.request.body.method).toBe(Methods.GET_DASHBOARD);
    dashboardReq.flush(json);
    //
    let service: DatasourceService = TestBed.inject(DatasourceService);
    service.datasource$.subscribe(data => fields = data.fields);
    const infoReq = httpMock.expectOne('/api/bi/');
    expect(infoReq.request.body.method).toBe(Methods.GET_DATASOURCE_INFO);
    infoReq.flush(jsonInfo);
}

describe('Service: DatasourceService for alarms', () => {
    beforeAll(() => {
        init(alarmsBoardBody, alarmsDatasourceInfoBody);
    });

    it('should return field list for group by element', () => {
        expect(fields.length).toBe(30);
    });

    it('check dict fields', () => {
        expect(fields.filter(f => f.dict).length).toBe(10);
    });

    it('check selectable fields', () => {
        expect(fields.filter(f => f.isSelectable).length).toBe(26);
    });

    it('check group #0', () => {
        expect(fields.filter(f => f.group === 0).length).toBe(14);
    });

    it('check group #1', () => {
        expect(fields.filter(f => f.group === 1).length).toBe(10);
    });

    it('check group #2', () => {
        expect(fields.filter(f => f.group === 2).length).toBe(2);
    });

    it('check group #3', () => {
        expect(fields.filter(f => f.group === 3).length).toBe(0);
    });

    it('check group #999', () => {
        expect(fields.filter(f => f.group === 999).length).toBe(4);
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
        expect(fields.filter(f => f.isGrouping).length).toBe(26);
    });

    it('check pseudo fields', () => {
        expect(fields.filter(f => f.pseudo).length).toBe(1);
    });
});

describe('Service: DatasourceService for reboots', () => {
    beforeAll(() => {
        init(rebootsBoardBody, rebootsDatasourceInfoBody);
    });

    it('should return field list for group by element', () => {
        expect(fields.length).toBe(14);
    });

    it('check dict fields', () => {
        expect(fields.filter(f => f.dict).length).toBe(9);
    });

    it('check selectable fields', () => {
        expect(fields.filter(f => f.isSelectable).length).toBe(12);
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
        expect(fields.filter(f => f.group === 3).length).toBe(0);
    });

    it('check group #999', () => {
        expect(fields.filter(f => f.group === 999).length).toBe(2);
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
    beforeAll(() => {
        init(interfacesBoardBody, interfacesDatasourceInfoBody);
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
        expect(fields.filter(f => f.group === 0).length).toBe(6);
    });

    it('check group #1', () => {
        expect(fields.filter(f => f.group === 1).length).toBe(2);
    });

    it('check group #2', () => {
        expect(fields.filter(f => f.group === 2).length).toBe(2);
    });

    it('check group #3', () => {
        expect(fields.filter(f => f.group === 3).length).toBe(2);
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
