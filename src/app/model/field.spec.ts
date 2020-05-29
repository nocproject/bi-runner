import { deserialize } from 'typescript-json-serializer';

import { board, field, mapBoard } from '../test-response/data/json';
import { Field } from './field';
import { Board } from './board';

describe('Deserialize Field model', () => {
    it('Deserialize Field', () => {
        const f: Field = deserialize<Field>(field, Field);
        expect('simple-app').toEqual('simple-app');
    });

    it('Deserialize Board', () => {
        const b: Board = deserialize<Board>(board, Board);
        expect('simple-app').toEqual('simple-app');
    });

    it('Deserialize geo-map Board', () => {
        const b: Board = deserialize<Board>(mapBoard, Board);
        expect('simple-app').toEqual('simple-app');
    });
});
