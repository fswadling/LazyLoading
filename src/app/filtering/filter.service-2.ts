import { Injectable } from '@angular/core';
import { FilterDescriptor2 } from './filter-descriptor-2';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService2 {
  constructor() { }

  private filtersMap = new Map<string, FilterDescriptor2>();
  private filtersSubject = new BehaviorSubject<FilterDescriptor2[]>([]);

  get filters(): FilterDescriptor2[] {
    return Array.from(this.filtersMap.values());
  }

  get filters$(): Observable<FilterDescriptor2[]> {
    return this.filtersSubject.asObservable();
  }

  addFilter(key: string, filter: FilterDescriptor2) {
   // if (!this.filtersMap.has(key)) {
      this.filtersMap.set(key, filter);
      this.filtersSubject.next(this.filters);
   // }
  }

  removeFilter(key: string) {
   // if (this.filtersMap.has(key)) {
      this.filtersMap.delete(key);
      this.filtersSubject.next(this.filters);
   // }
  }
}
