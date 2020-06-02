import { ActivatedRouteSnapshot } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
//
import { APIService, BoardService } from '@app/services';
import { Board } from '@app/model';
import { Methods } from '@app/model';
// Test data
import * as rebootsBoardBody from '@test/rebootsBoardBody.json';

describe('Deserialization: Board', () => {
    let injector: TestBed;
    let httpMock: HttpTestingController;
    let board: Board;
    let service: BoardService;

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                APIService,
                {
                    provide: BoardService,
                    useFactory: (api) => new BoardService(api),
                    deps: [APIService]
                }

            ]
        });

        injector = getTestBed();
        httpMock = injector.inject(HttpTestingController);
        service = injector.inject(BoardService);
        let route = new ActivatedRouteSnapshot();
        route.params = {id: '1'};
        service.resolve(route, null);
        service.board$.subscribe(data =>
            board = data
        );

        const dashboardReq = httpMock.expectOne('/api/bi/');
        expect(dashboardReq.request.body.method).toBe(Methods.GET_DASHBOARD);
        dashboardReq.flush(rebootsBoardBody);
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
