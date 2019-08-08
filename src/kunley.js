import { scan } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export class Kunley {
  constructor(
    initialState = {},
    initialAction = { type: 'INIT', reducer: state => state },
    debug = false
  ) {
    this._action$ = new BehaviorSubject(initialAction);
    this._state$ = new BehaviorSubject(initialState);
    const applyReducer = scan(
      (state, action) => (action.reducer ? action.reducer(state) : state),
      initialState
    );
    const pipeIntoState$ = state => this._state$.next(state);
    this._action$.pipe(applyReducer).subscribe(pipeIntoState$);
    this._action$.subscribe(action => (debug ? { action } : undefined));
    this._state$.subscribe(state => (debug ? { state } : undefined));
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

export function createKunley(initialState) {
  return new Kunley(initialState);
}
