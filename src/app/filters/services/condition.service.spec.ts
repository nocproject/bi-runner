import { TestBed, inject } from '@angular/core/testing';

import { ConditionService } from './condition.service';

describe('ConditionService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ConditionService]
        });
    });

    it('should be created', inject([ConditionService], (service: ConditionService) => {
        expect(service).toBeTruthy();
    }));

    it('should be Dictionary', inject([ConditionService], (service: ConditionService) => {
        expect(service.conditions('Dictionary').length).toEqual(2, 'Dictionary condition is not 2');
    }));
});
