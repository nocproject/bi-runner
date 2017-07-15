import { TestBed, inject, async } from '@angular/core/testing';

import { ConditionService } from './condition.service';

describe('ConditionService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ConditionService]
        });
    });

    it('service should be created', inject([ConditionService], (service: ConditionService) => {
        expect(service).toBeTruthy();
    }));

    it('retrieve duration_intervals conditions', async(inject([ConditionService], (service) => {
        service.conditions('duration_intervals', 'Dictionary')
            .subscribe(result =>
                expect(result.length).toEqual(2)
            );
    })));
});
