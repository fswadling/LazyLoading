import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { tap, switchMap, map } from "rxjs/operators";
import { LazyLoadBackendReturn } from "./lazy-load";

export type BackendTreatData<TTreatDataArgs, TBackendResult> = (treatData$: Observable<TTreatDataArgs>) => Observable<TBackendResult>;
export type FrontEndTreatData<TTreatDataArgs, TRow> = (data: TRow[], args: TTreatDataArgs) => TRow[];
export type SwitchToFrontEnd<TBackendResult> = (data: TBackendResult) => boolean;

export class SwitchToFrontEndDataTreatment<TTreatDataArgs, TRow> {
  private partiallyLoadedSubject: BehaviorSubject<TTreatDataArgs>;
  private fullyLoadedSubject: BehaviorSubject<TTreatDataArgs>;
  private subscription: Subscription;

  fullyLoaded = false;

  constructor(defaultTreatDataArgs: TTreatDataArgs) {
    this.partiallyLoadedSubject = new BehaviorSubject(defaultTreatDataArgs);
    this.fullyLoadedSubject = new BehaviorSubject(defaultTreatDataArgs);
  }

  getObservable(treatDataRequests: Observable<TTreatDataArgs>, backendLoad: BackendTreatData<TTreatDataArgs, LazyLoadBackendReturn<TRow>>, frontEndTreatData: FrontEndTreatData<TTreatDataArgs, TRow>) : Observable<TRow[]> {
    this.subscription = treatDataRequests.subscribe(sort => {
      if (this.fullyLoaded) {
        this.fullyLoadedSubject.next(sort);
      } else {
        this.partiallyLoadedSubject.next(sort);
      }
    });

    return backendLoad(this.partiallyLoadedSubject.asObservable()).pipe(
      map(data => data.data),
      switchMap(data => this.fullyLoadedSubject.asObservable().pipe(map<TTreatDataArgs, [TRow[], TTreatDataArgs]>(sort => [data, sort]))),
      map(([data, args]) => (this.fullyLoaded) ? frontEndTreatData(data, args) : data),
    );
  }

  dispose() {
    this.partiallyLoadedSubject.complete();
    this.fullyLoadedSubject.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}