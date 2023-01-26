import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeProcessusDelailsComponent } from './liste-processus-details.component';

describe('ListeProcessusDelailsComponent', () => {
  let component: ListeProcessusDelailsComponent;
  let fixture: ComponentFixture<ListeProcessusDelailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeProcessusDelailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeProcessusDelailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
