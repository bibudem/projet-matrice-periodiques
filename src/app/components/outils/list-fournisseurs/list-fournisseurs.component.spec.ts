import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFournisseursComponent } from './list-fournisseurs.component';

describe('ListFournisseursComponent', () => {
  let component: ListFournisseursComponent;
  let fixture: ComponentFixture<ListFournisseursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFournisseursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFournisseursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
