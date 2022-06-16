import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportationSushiComponent } from './importation-sushi.component';

describe('ImportationSushiComponent', () => {
  let component: ImportationSushiComponent;
  let fixture: ComponentFixture<ImportationSushiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportationSushiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportationSushiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
