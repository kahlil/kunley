import { scan } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export class Kunley {
  constructor(initialState, init) {
    const initialAction = init || (state => state);
    this._action$ = new BehaviorSubject(initialAction);
    this._state$ = new BehaviorSubject(initialState);

    this._action$
      .pipe(
        scan(
          (state, actionWithPayload) => actionWithPayload(state),
          initialState
        )
      )
      .subscribe(state => this._state$.next(state));
  }

  dispatch(action) {
    this._action$.next(action);
  }

  get state$() {
    return this._state$;
  }

  get action$() {
    return this._action$;
  }

  runSideEffects(...sideEffects) {
    sideEffects.map(sideEffect => {
      sideEffect(this._action$).subscribe(action => this._action$.next(action));
    });
  }
}

export function createKunley() {
  return new Kunley();
}
