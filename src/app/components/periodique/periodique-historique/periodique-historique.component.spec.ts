import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodiqueHistoriqueComponent } from './periodique-historique.component';

describe('PeriodiqueHistoriqueComponent', () => {
  let component: PeriodiqueHistoriqueComponent;
  let fixture: ComponentFixture<PeriodiqueHistoriqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodiqueHistoriqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodiqueHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
