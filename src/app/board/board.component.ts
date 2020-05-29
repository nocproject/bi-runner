import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { head } from 'lodash';

import { Board, Cell, Widget, WidgetRow } from '@app/model';
import { BoardService, LayoutService } from '@app/services';
import { FilterService } from './services/filter.service';
import { FieldsTableService } from './services/fields-table.service';

@Component({
    selector: 'bi-board',
    templateUrl: './board.component.html',
})

export class BoardComponent implements OnInit, OnDestroy {
    public rows: WidgetRow[];
    public board: Board;
    private subscription: Subscription;

    constructor(public boardResolver: BoardService,
                private route: ActivatedRoute,
                private layoutService: LayoutService,
                private fieldsTableService: FieldsTableService,
                private filterService: FilterService) {
    }

    ngOnInit(): void {
        this.filterService.cleanFilters();
        this.fieldsTableService.cleanFields();
        this.subscription = this.route.data.pipe(
            map(data => data['detail'])
        ).subscribe((board: Board) => {
                this.filterService.initFilters(board.groups);
                this.fieldsTableService.fieldsNext(board.exportQry.params[0].fields);
                this.board = board;
                this.rows = this.widgetsByRow(board.layout.cells, board.widgets);
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

    private widgetsByRow(cells: Cell[], widgets: Widget[]): WidgetRow[] {
        const rows: WidgetRow[] = [];
        const sortedByRow = cells.sort((a, b) => a.row - b.row);
        if (cells.length) {
            let currentRow: number = sortedByRow[0].row;
            let row: WidgetRow = {
                row: currentRow,
                cells: []
            };

            for (const cell of sortedByRow) {
                if (currentRow !== cell.row) {
                    rows.push(row);
                    currentRow = cell.row;
                    row = {
                        row: currentRow,
                        cells: []
                    };
                }
                row.cells.push({cell: cell, widget: this.widgetForCell(widgets, cell)});
            }
            rows.push(row);
        }
        return rows;
    }

    private widgetForCell(widgets: Widget[], cell: Cell): Widget {
        return head(widgets.filter(item => item.cell === cell.name));
    }
}
