import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { head } from 'lodash';

import { Board, Cell, CellAndWidget, Widget } from '@app/model';
import { LayoutService } from '@app/services';
import { BoardResolver } from './services/board.resolver';
import { DatasourceService } from './services/datasource-info.service';
import { FilterService } from './services/filter.service';
import { FieldsTableService } from './services/fields-table.service';

@Component({
    selector: 'bi-board',
    templateUrl: './board.component.html',
    providers: [
        DatasourceService
    ]
})

export class BoardComponent implements OnInit, OnDestroy {
    public cells: CellAndWidget[][];
    public board: Board;
    private subscription: Subscription;

    constructor(public boardResolver: BoardResolver,
                private route: ActivatedRoute,
                private layoutService: LayoutService,
                private fieldsTableService: FieldsTableService,
                private filterService: FilterService) {
    }

    ngOnInit(): void {
        this.filterService.cleanFilters();
        this.fieldsTableService.cleanFields();
        this.subscription = this.route.data.map(data => data['detail'])
            .subscribe(
                (board: Board) => {
                    this.filterService.initFilters(board.groups);
                    this.fieldsTableService.fieldsNext(board.exportQry.params[0].fields);
                    this.board = board;
                    this.cells = this.cellsByRow(board.layout.cells, board.widgets);
                    this.filterService.ratioSubject.next(board.sample ? board.sample : 1);
                    this.boardResolver.next(board);
                    this.layoutService.isReportOpenSubject.next(true);
                }
            );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.layoutService.isReportOpenSubject.next(false);
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
        return head(widgets.filter(item => item.cell === cell.name));
    }
}
