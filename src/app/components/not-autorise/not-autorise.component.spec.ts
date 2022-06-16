import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAutoriseComponent } from './page-not-found.component';

describe('NotAutoriseComponent', () => {
  let component: NotAutoriseComponent;
  let fixture: ComponentFixture<NotAutoriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotAutoriseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAutoriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
