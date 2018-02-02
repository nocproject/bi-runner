import { async, TestBed } from '@angular/core/testing';

import { ConditionService } from './condition.service';

describe('ConditionService', () => {
    let service: ConditionService;

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [ConditionService]
        });

        service = TestBed.get(ConditionService);
    });

    it('service should be created', () => {
        expect(service).toBeTruthy();
    });

    it('retrieve exclusion_intervals conditions', async(() => {
        service.conditions('exclusion_intervals')
            .subscribe(result =>
                expect(result.length).toEqual(2)
            );
    }));
});
