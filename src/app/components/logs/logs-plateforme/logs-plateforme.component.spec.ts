import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsPlateformeComponent } from './logs-plateforme.component';

describe('LogsPlateformeComponent', () => {
  let component: LogsPlateformeComponent;
  let fixture: ComponentFixture<LogsPlateformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogsPlateformeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogsPlateformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
