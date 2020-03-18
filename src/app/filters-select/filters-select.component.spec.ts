import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersSelectComponent } from './filters-select.component';

describe('FiltersSelectComponent', () => {
  let component: FiltersSelectComponent;
  let fixture: ComponentFixture<FiltersSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltersSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
