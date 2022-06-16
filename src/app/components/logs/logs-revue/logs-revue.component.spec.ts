import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsRevueComponent } from './logs-revue.component';

describe('LogsRevueComponent', () => {
  let component: LogsRevueComponent;
  let fixture: ComponentFixture<LogsRevueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogsRevueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogsRevueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
