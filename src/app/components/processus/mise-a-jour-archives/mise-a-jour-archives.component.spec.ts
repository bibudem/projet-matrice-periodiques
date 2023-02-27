import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiseAJourArchivesComponent } from './mise-a-jour-archives.component';

describe('MiseAJourArchivesComponent', () => {
  let component: MiseAJourArchivesComponent;
  let fixture: ComponentFixture<MiseAJourArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiseAJourArchivesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiseAJourArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
