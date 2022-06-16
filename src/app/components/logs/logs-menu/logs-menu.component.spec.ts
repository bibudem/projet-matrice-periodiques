import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsMenuComponent } from './logs-menu.component';

describe('LogsMenuComponent', () => {
  let component: LogsMenuComponent;
  let fixture: ComponentFixture<LogsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
