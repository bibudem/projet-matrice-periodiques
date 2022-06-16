import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodiquePrixComponent } from './periodique-prix.component';

describe('PeriodiquePrixComponent', () => {
  let component: PeriodiquePrixComponent;
  let fixture: ComponentFixture<PeriodiquePrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodiquePrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodiquePrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
