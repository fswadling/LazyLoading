import { Component, ElementRef } from '@angular/core';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { MockBackendService } from './mock-backend.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { GetPagedData, ResettingLazyLoad, LazyLoadBackendReturn } from './sorting/lazy-load';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { FilterDescriptor2 } from './filtering/filter-descriptor-2';
import { filter } from './filtering/filter';
import { SwitchToFrontEndDataTreatment } from './sorting/switch-to-front-end';
import { FilterService2 } from './filtering/filter.service-2';

type SortAndFilterDescriptors = [SortDescriptor[], FilterDescriptor2[]];

@Component({
    selector: 'my-app',
    template: `
      <div class="example-config">
        <label class="k-form-field">
          <input class="k-checkbox" type="checkbox" id="allowUnsort"
              [(ngModel)]="allowUnsort" />
          <label class="k-checkbox-label" for="allowUnsort">
            {{ allowUnsort ? 'Disable': 'Enable' }} unsorting
          </label>
        </label><br/>
        <label class="k-form-field">
          <input class="k-checkbox" type="checkbox" id="multiple"
              [(ngModel)]="multiple"
              />
          <label class="k-checkbox-label" for="multiple">
            {{ multiple ? 'Disable': 'Enable' }} multiple columns sorting
          </label>
        </label>
      </div>
      <app-filters-select></app-filters-select>
      <kendo-grid
          [data]="gridView$ | async"
          [height]="530"
          [sortable]="{
            allowUnsort: allowUnsort,
            mode: multiple ? 'multiple' : 'single'
            }"
          [sort]="sort$ | async"
          (sortChange)="sortChange($event)"
          (scrollBottom)="triggerLazyLoad()"
        >
        <kendo-grid-column field="ProductID" title="ID" width="80">
        </kendo-grid-column>
        <kendo-grid-column field="ProductName" title="Product Name">
        </kendo-grid-column>
        <kendo-grid-column field="UnitPrice" title="Unit Price" width="230">
        </kendo-grid-column>
      </kendo-grid>
      <p *ngIf="isLoading">Loading...<p>
  `
})
export class AppComponent {
    public multiple = false;
    public allowUnsort = true;
    public isLoading = false;

    private sortSubject = new BehaviorSubject<SortDescriptor[]>([])
    private lazyLoadSubject = new BehaviorSubject<any>({});

    gridView$: Observable<GridDataResult>;

    get sort$() {
      return this.sortSubject.asObservable();
    }

    private sortCore = new SwitchToFrontEndDataTreatment<any, SortAndFilterDescriptors>([[], []]); 

    constructor(private elRef: ElementRef, private backend: MockBackendService, private filterService: FilterService2) {
      const treatDataArgs: Observable<SortAndFilterDescriptors> = combineLatest(
        this.sort$, 
        this.filterService.filters$);

      this.gridView$ = this.setupSortCoreObservable(treatDataArgs).pipe(
        map(data => ({
          data: data,
          total: data.length
        })),
      );
    }

    private setupSortCoreObservable(treatDataArgs$: Observable<SortAndFilterDescriptors>): Observable<any[]> {
      return this.sortCore.getObservable(
        treatDataArgs$,
        args => this.backendtreatData(args),
        (data, args) => this.frontendTreatData(data, args));
    }

    private frontendTreatData(data: any[], args: SortAndFilterDescriptors): any[] {
      data = filter(data, args[1]);
      data = orderBy(data, args[0]);
      return data;
    }

    private backendtreatData(dataArgs$: Observable<SortAndFilterDescriptors>): Observable<LazyLoadBackendReturn<any>> {
      return dataArgs$.pipe(
        map(dataArgs => this.getBackendCall(dataArgs[0], dataArgs[1])),
        switchMap(getData => this.setupLazyLoad(getData))
      );
    }

    private getBackendCall(sort: SortDescriptor[], filter: FilterDescriptor2[]) {
      const getData = (start: number, count: number) => this.backend.getNProducts(sort, filter, start, count).pipe(
        tap(result => this.sortCore.fullyLoaded = (result.isFinished && filter.length === 0))
      );
      return getData;
    }

    private setupLazyLoad(getData: GetPagedData<any>) {
      return ResettingLazyLoad(
        getData,
        this.lazyLoadSubject.asObservable(),
        () => this.scrollToTop(),
        isLoad => this.isLoading = isLoad,
        30);
    }

    private scrollToTop() {
      let gridContent = this.elRef.nativeElement.getElementsByClassName('k-grid-content')[0];
      if (gridContent) {
        gridContent.scrollTop = 0;
      }
    }

    sortChange(sort: SortDescriptor[]): void {
      this.sortSubject.next(sort);
    }

    triggerLazyLoad() {
      this.lazyLoadSubject.next({});
    }
}
