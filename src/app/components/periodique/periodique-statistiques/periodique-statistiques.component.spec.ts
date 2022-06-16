import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodiqueStatistiquesComponent } from './periodique-statistiques.component';

describe('PeriodiqueStatistiquesComponent', () => {
  let component: PeriodiqueStatistiquesComponent;
  let fixture: ComponentFixture<PeriodiqueStatistiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodiqueStatistiquesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodiqueStatistiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
