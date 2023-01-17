import { ComponentFixture, TestBed } from '@angular/core/testing';

import {MiseEnLotPeriodiquesComponent} from "./importation-en-lot-periodiques.component";

describe('MiseAJourPrixComponent', () => {
  let component: MiseEnLotPeriodiquesComponent;
  let fixture: ComponentFixture<MiseEnLotPeriodiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiseEnLotPeriodiquesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiseEnLotPeriodiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
