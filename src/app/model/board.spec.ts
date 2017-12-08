import { BaseRequestOptions, Response, ResponseOptions } from '@angular/http';

import { TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';

import { APIService } from '../services';
import { Board } from './board';
import { Http, InterceptorStore } from '../shared/interceptor/service';
//
import { Methods } from './methods.enum';
import { QueryBuilder } from './query.builder';
// Test data
import * as boardBody from '/Users/dima/Projects/bi-runner/src/app/test-response/rebootsBoardBody.json';

describe('Deserialization: Board', () => {
    let backend: MockBackend;
    let board: Board;
    let api: APIService;

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                InterceptorStore,
                MockBackend,
                BaseRequestOptions,
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
        api = TestBed.get(APIService);

        // When the request subscribes for results on a connection, return a fake response
        backend.connections.subscribe(connection => {
            connection.mockRespond(new Response(<ResponseOptions>{
                body: JSON.stringify(boardBody)
            }));
        });

        // Perform a request and make sure we get the response we expect
        api.execute(new QueryBuilder()
            .method(Methods.GET_DASHBOARD)
            .params([])
            .build())
            .map(response => Board.fromJSON(response.result))
            .subscribe(_board => board = _board);
    });

    it('should return instance of Board', () => {
        expect(board).toBeTruthy();
    });

    it('check id property', () => {
        expect(board.id).toBe('59e9b6b7c165cf607b9383e6');
    });

    it('check layoutId property', () => {
        expect(board.layoutId).toBe('580e1ba498601c0f96b7e809');
    });

    it('check title property', () => {
        expect(board.title).toBe('Перезагрузки v2');
    });

    it('check description property', () => {
        expect(board.description).toBe('описание отчета по перезагрузкам');
    });

    it('check datasource property', () => {
        expect(board.datasource).toBe('reboots');
    });

    it('check format property', () => {
        expect(board.format).toBe(2);
    });

    it('check sample property', () => {
        expect(board.sample).toBe(1);
    });

    it('check widgets property', () => {
        expect(board.widgets.length).toBe(5);
    });

    it('check agvFields property', () => {
        expect(board.agvFields.length).toBe(12);
    });

    it('check filterFields property', () => {
        expect(board.filterFields.length).toBe(14);
    });

    it('check pseudoFields property', () => {
        expect(board.pseudoFields.length).toBe(0);
    });

    it('check layout property', () => {
        expect(board.layout).toBeTruthy();
    });

    // it('check  property', () => {
    //     expect(board.).toBe();
    // });
});
