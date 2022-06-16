import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListePlateformesComponent } from './liste-plateformes.component';

describe('ListePlateformesComponent', () => {
  let component: ListePlateformesComponent;
  let fixture: ComponentFixture<ListePlateformesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListePlateformesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListePlateformesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
