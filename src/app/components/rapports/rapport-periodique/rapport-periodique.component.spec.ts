import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportPeriodiqueComponent } from './rapport-periodique.component';

describe('RapportPeriodiqueComponent', () => {
  let component: RapportPeriodiqueComponent;
  let fixture: ComponentFixture<RapportPeriodiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RapportPeriodiqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportPeriodiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
