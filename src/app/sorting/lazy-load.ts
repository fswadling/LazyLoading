import { Observable, of } from "rxjs";
import { map, exhaustMap, tap, filter, switchMap } from "rxjs/operators";

export type GetPagedData<TRow> = (start: number, count: number) => Observable<LazyLoadBackendReturn<TRow>>;
export type OnReset = () => void; 
export type OnLoading = (isLoading: boolean) => void;
export type GetNextDataChunk<TRow> = (getData: GetPagedData<TRow>, readStart: number, state: { isFinished: boolean }) => Observable<TRow[]>

export interface LazyLoadBackendReturn<TRow> {
  data: TRow[],
  isFinished: boolean
}

function appendNewDataToExistingData<TRow>(newRows: TRow[], state: { rows: TRow[] }) {
  state.rows = state.rows.concat(newRows);
  return state.rows;
}

function internalLazyLoad<TRow>(requests: Observable<any>, getData: GetPagedData<TRow>, getNextChunk: GetNextDataChunk<TRow>): Observable<LazyLoadBackendReturn<TRow>> {
  const state: { rows: TRow[], isFinished: boolean }  = { rows: [], isFinished: false };

  return requests.pipe(
    filter(() => !state.isFinished),
    map(_ => state.rows.length),
    exhaustMap(readStart => getNextChunk(getData, readStart, state)),
    map(newRows => appendNewDataToExistingData(newRows, state)),
    map(rows => ({ data: rows, isFinished: state.isFinished }))
  );
}

function CallMethodOnFirstEvent<TPayload>(obs: Observable<TPayload>,  onReset: OnReset): Observable<TPayload> {
  let isReset = true;
  return obs.pipe(
    tap(() => {
      if (isReset) {
        isReset = false;
        onReset();
      }
    })
  );
}

function getNextChunkOfData<TRow>(getData: GetPagedData<TRow>, state: { isFinished: boolean }, onLoading: OnLoading, readStart: number, readSize: number): Observable<TRow[]> {
  if (state.isFinished) {
    return of([]);
  }

  return of(true).pipe(
    tap(() => onLoading(true)),
    switchMap(() => getData(readStart, readSize)),
    tap(() => onLoading(false)),
    tap(result => state.isFinished = result.isFinished),
    map(result => result.data)
  );
}

export function LazyLoad<TRow>(getData: GetPagedData<TRow>, requests: Observable<any>, onLoading: OnLoading, readSize: number) {
  const getNextChunk: GetNextDataChunk<TRow> = (getData, readStart, state) => getNextChunkOfData(getData, state, onLoading, readStart, readSize);
  return internalLazyLoad(requests, getData, getNextChunk);
}

export function ResettingLazyLoad<TRow>(getData: GetPagedData<TRow>, requests: Observable<any>, onReset: OnReset, onLoading: OnLoading, readSize: number): Observable<LazyLoadBackendReturn<TRow>> {
  const getNextChunk: GetNextDataChunk<TRow> = (getData, readStart, state) => getNextChunkOfData(getData, state, onLoading, readStart, readSize);
  const dataStream$ = internalLazyLoad(requests, getData, getNextChunk)
  return CallMethodOnFirstEvent(dataStream$, onReset)
}

