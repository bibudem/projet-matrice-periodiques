import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiseAJourAbonnementComponent } from './mise-a-jour-abonnement.component';

describe('MiseAJourAbonnementComponent', () => {
  let component: MiseAJourAbonnementComponent;
  let fixture: ComponentFixture<MiseAJourAbonnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiseAJourAbonnementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiseAJourAbonnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
