import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

import { Board, Cell, CellAndWidget, Widget } from '../../model';
import { FieldListService, FilterService } from '../../services';

@Component({
    selector: 'bi-board',
    templateUrl: './board.component.html',
    providers: [FieldListService]
})

export class BoardComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    public cells: CellAndWidget[][];
    public board: Board;

    constructor(private route: ActivatedRoute,
                private fieldListService: FieldListService,
                private filterService: FilterService) {
    }

    ngOnInit(): void {
        this.filterService.cleanFilters();
        this.filterService.cleanGroups();
        this.subscription = this.route.data.map(data => data['detail'])
            .subscribe(
                (board: Board) => {
                    this.fieldListService.init(board);
                    this.filterService.initFilters(board.groups);
                    this.filterService.groupsNext(board.exportQry.params[0].fields);
                    this.board = board;
                    this.cells = this.cellsByRow(board.layout.cells, board.widgets);
                    this.filterService.ratioSubject.next(board.sample ? board.sample : 1);
                    this.filterService.boardSubject.next(board);
                    this.filterService.isReportOpenSubject.next(true);
                }
            );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.filterService.boardSubject.next(null);
        this.filterService.isReportOpenSubject.next(false);
    }

    private cellsByRow(cells: Cell[], widgets: Widget[]): CellAndWidget[][] {
        const cellsByRow: Array<CellAndWidget[]> = [];
        const sortedByRow = cells.sort((a, b) => a.row - b.row);
        let currentRow: number = sortedByRow[0].row;
        let row: CellAndWidget[] = [];

        for (const cell of sortedByRow) {
            if (currentRow !== cell.row) {
                cellsByRow[currentRow] = row;
                currentRow = cell.row;
                row = [];
            }
            row.push({cell: cell, widget: this.widgetForCell(widgets, cell)});
        }
        cellsByRow[currentRow] = row;
        return cellsByRow;
    }

    private widgetForCell(widgets: Widget[], cell: Cell): Widget {
        return _.head(widgets.filter(item => item.cell === cell.name));
    }
}
