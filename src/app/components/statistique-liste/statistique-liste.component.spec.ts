import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiqueListeComponent } from './statistique-liste.component';

describe('StatistiqueListeComponent', () => {
  let component: StatistiqueListeComponent;
  let fixture: ComponentFixture<StatistiqueListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatistiqueListeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatistiqueListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
