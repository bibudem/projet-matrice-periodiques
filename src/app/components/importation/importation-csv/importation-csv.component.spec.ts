import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportationCsvComponent } from './importation-csv.component';

describe('ImportationCsvComponent', () => {
  let component: ImportationCsvComponent;
  let fixture: ComponentFixture<ImportationCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportationCsvComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportationCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
