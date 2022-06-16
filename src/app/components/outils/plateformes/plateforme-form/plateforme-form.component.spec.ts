import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateformeFormComponent } from './plateforme-form.component';

describe('PlateformeFormComponent', () => {
  let component: PlateformeFormComponent;
  let fixture: ComponentFixture<PlateformeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlateformeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateformeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
