import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodiqueArchiveComponent } from './periodique-archive.component';

describe('PeriodiqueArchiveComponent', () => {
  let component: PeriodiqueArchiveComponent;
  let fixture: ComponentFixture<PeriodiqueArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodiqueArchiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodiqueArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
