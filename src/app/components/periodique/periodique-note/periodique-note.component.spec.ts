import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodiqueNoteComponent } from './periodique-note.component';

describe('PeriodiqueNoteComponent', () => {
  let component: PeriodiqueNoteComponent;
  let fixture: ComponentFixture<PeriodiqueNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodiqueNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodiqueNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
