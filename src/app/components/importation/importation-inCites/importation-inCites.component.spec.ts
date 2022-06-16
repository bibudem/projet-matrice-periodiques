import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportationInCitesComponent } from './importation-inCites.component';

describe('ImportationCsvComponent', () => {
  let component: ImportationInCitesComponent;
  let fixture: ComponentFixture<ImportationInCitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportationInCitesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportationInCitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
