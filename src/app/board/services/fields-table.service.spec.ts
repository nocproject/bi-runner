import { TestBed, inject } from '@angular/core/testing';

import { FieldsTableService } from './fields-table.service';

describe('FieldsTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FieldsTableService]
    });
  });

  it('should be created', inject([FieldsTableService], (service: FieldsTableService) => {
    expect(service).toBeTruthy();
  }));
});
