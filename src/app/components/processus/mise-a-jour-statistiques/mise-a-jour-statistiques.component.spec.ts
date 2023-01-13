import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiseAJourStatistiquesComponent } from './mise-a-jour-statistiques.component';

describe('MiseAJourPrixComponent', () => {
  let component: MiseAJourStatistiquesComponent;
  let fixture: ComponentFixture<MiseAJourStatistiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiseAJourStatistiquesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiseAJourStatistiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
