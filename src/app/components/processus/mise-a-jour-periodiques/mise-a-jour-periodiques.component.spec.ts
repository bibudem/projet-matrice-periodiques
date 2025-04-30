import { ComponentFixture, TestBed } from '@angular/core/testing';

import {MiseAJourPeriodiquesComponent} from "./mise-a-jour-periodiques.component";

describe('MiseAJourPeriodiquesComponent', () => {
  let component: MiseAJourPeriodiquesComponent;
  let fixture: ComponentFixture<MiseAJourPeriodiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiseAJourPeriodiquesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiseAJourPeriodiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
