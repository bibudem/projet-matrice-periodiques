import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodiqueListeComponent } from './periodique-liste.component';

describe('PeriodiqueListeComponent', () => {
  let component: PeriodiqueListeComponent;
  let fixture: ComponentFixture<PeriodiqueListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodiqueListeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodiqueListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
