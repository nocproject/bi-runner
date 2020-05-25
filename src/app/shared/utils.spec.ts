import { Utils } from './utils';

describe('Utils class', () => {
    it('', () => {
        expect(Utils.reductionName({desc: '123456789012345'})).toEqual('1234567890...');
    });
    it('dateToString', () =>{
        expect(Utils.dateToString(new Date('2018-12-31T21:00:00.000Z'), '%d.%m.%y')).toEqual('01.01.19');
    })
    it('intFormat < 1', ()=>{
        expect(Utils.intFormat('0.123456789')).toEqual('0.1235');
    })
    it('intFormat < 100', ()=>{
        expect(Utils.intFormat('20.123456789')).toEqual('20.12');
    })
    it('intFormat > 100', ()=>{
        expect(Utils.intFormat('200.123456789')).toEqual('200');
    })
});
