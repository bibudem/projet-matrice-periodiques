import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiseAJourPrixComponent } from './mise-a-jour-prix.component';

describe('MiseAJourPrixComponent', () => {
  let component: MiseAJourPrixComponent;
  let fixture: ComponentFixture<MiseAJourPrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiseAJourPrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiseAJourPrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
