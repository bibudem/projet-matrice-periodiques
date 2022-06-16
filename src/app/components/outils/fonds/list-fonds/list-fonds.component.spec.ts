import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFondsComponent } from './list-fonds.component';

describe('ListFondsComponent', () => {
  let component: ListFondsComponent;
  let fixture: ComponentFixture<ListFondsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFondsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFondsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
