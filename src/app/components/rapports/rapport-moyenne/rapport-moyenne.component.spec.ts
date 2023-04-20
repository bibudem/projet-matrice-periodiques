import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportMoyenneComponent } from './rapport-moyenne.component';

describe('RapportPlateformesComponent', () => {
  let component: RapportMoyenneComponent;
  let fixture: ComponentFixture<RapportMoyenneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RapportMoyenneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportMoyenneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
