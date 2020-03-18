import { Injectable } from '@angular/core';
import { timer, Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators'
import { products } from './products';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { FilterDescriptor2 } from './filtering/filter-descriptor-2';
import { filter } from './filtering/filter';
import { LazyLoadBackendReturn } from './sorting/lazy-load';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {

  constructor() { }

  getProductsWithSort(sort: SortDescriptor[]) {
    return timer(1000).pipe(
      first(),
      map(_ => products),
      map(products => orderBy(products, sort))
    );
  }

  getProducts() {
    return timer(1000).pipe(
      first(),
      map(_ => products),
    )
  }

  getProductsCount(): Observable<number> {
    return timer(100)
      .pipe(
        first(),
        map(_ => products.length)
      );
  }

  getNProducts(sort: SortDescriptor[], filters: FilterDescriptor2[], start: number, count: number): Observable<LazyLoadBackendReturn<any>> {
    return timer(1000).pipe(
      first(),
      map(_ => filter(products, filters)),
      map(prods => orderBy(prods, sort)),
      map(rows => { 
        let x = rows.slice(start, start + count);
        return x;
      }),
      map(rows => ({
        data: rows,
        isFinished: rows.length < count
      }))
    );
  }
}
