import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotUserComponent } from './page-not-found.component';

describe('NotUserComponent', () => {
  let component: NotUserComponent;
  let fixture: ComponentFixture<NotUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
