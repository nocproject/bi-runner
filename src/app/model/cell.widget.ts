import { Cell } from './cell';
import { Widget } from './widget';

export interface WidgetRow {
    row: number;
    cells: CellAndWidget[];
}

export interface CellAndWidget {
    cell: Cell;
    widget: Widget;
}
