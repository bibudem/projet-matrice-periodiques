import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodiqueFormulaireComponent } from './periodique-formulaire.component';

describe('PeriodiqueFormulaireComponent', () => {
  let component: PeriodiqueFormulaireComponent;
  let fixture: ComponentFixture<PeriodiqueFormulaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodiqueFormulaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodiqueFormulaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
