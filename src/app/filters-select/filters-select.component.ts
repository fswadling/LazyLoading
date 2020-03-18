import { Component, OnInit } from '@angular/core';
import { FilterService2 } from '../filtering/filter.service-2';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FilterDescriptor2 } from '../filtering/filter-descriptor-2';

@Component({
  selector: 'app-filters-select',
  templateUrl: './filters-select.component.html',
  styleUrls: ['./filters-select.component.css']
})
export class FiltersSelectComponent implements OnInit {

  formGroup: FormGroup; 

  constructor(private filterService: FilterService2, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      range: this.formBuilder.group({
        filterMinVal: 0,
        filterMaxVal: 0,
        isRangeChecked: false,
      }),
      value: this.formBuilder.group({
        filterVal: 0,
        isValueChecked: false,
      }),
      values: this.formBuilder.group({
        value1: 0,
        value2: 0,
        isValuesChecked: false
      })
    });
  }

  

  ngOnInit() {
    this.formGroup.get('range').valueChanges.subscribe(group => {
      if (group.isRangeChecked) {
        const filter: FilterDescriptor2 = {
          field: 'UnitPrice',
          range: { from: group.filterMinVal, to: group.filterMaxVal },
          value: undefined,
          values: undefined
        };

        this.filterService.addFilter('range', filter);
      } else {
        this.filterService.removeFilter('range');
      }
    });

    this.formGroup.get('value').valueChanges.subscribe(group => {
      if (group.isValueChecked) {
        const filter: FilterDescriptor2 = {
          field: 'UnitPrice',
          range: undefined,
          value: group.filterVal,
          values: undefined
        };

        this.filterService.addFilter('value', filter);
      } else {
        this.filterService.removeFilter('value');
      }
    });

    this.formGroup.get('values').valueChanges.subscribe(group => {
      if (group.isValuesChecked) {
        const filter: FilterDescriptor2 = {
          field: 'UnitPrice',
          range: undefined,
          value: undefined,
          values: [group.value1, group.value2]
        };

        this.filterService.addFilter('values', filter);
      } else {
        this.filterService.removeFilter('values');
      }
    });
  }
}
