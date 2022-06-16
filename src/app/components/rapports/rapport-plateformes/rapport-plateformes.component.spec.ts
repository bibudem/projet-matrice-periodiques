import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportPlateformesComponent } from './rapport-plateformes.component';

describe('RapportPlateformesComponent', () => {
  let component: RapportPlateformesComponent;
  let fixture: ComponentFixture<RapportPlateformesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RapportPlateformesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportPlateformesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
