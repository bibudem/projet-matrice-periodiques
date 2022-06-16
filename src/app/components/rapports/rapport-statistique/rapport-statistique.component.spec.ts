import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportStatistiqueComponent } from './rapport-statistique.component';

describe('RapportStatistiqueComponent', () => {
  let component: RapportStatistiqueComponent;
  let fixture: ComponentFixture<RapportStatistiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RapportStatistiqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportStatistiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
