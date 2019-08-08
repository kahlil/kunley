import { scan } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export class Kunley {
  constructor(
    initialState = {},
    initialAction = { type: 'INIT', reducer: state => state },
    debug = false
  ) {
    this.action$ = new BehaviorSubject(initialAction);
    this.state$ = new BehaviorSubject(initialState);
    const applyReducer = scan(
      (state, action) => (action.reducer ? action.reducer(state) : state),
      initialState
    );
    const pipeIntoState$ = state => this.state$.next(state);
    this.action$.pipe(applyReducer).subscribe(pipeIntoState$);
    this.action$.subscribe(action => (debug ? { action } : undefined));
    this.state$.subscribe(state => (debug ? { state } : undefined));
  }

  dispatch(action) {
    this.action$.next(action);
  }

  runSideEffects(...sideEffects) {
    sideEffects.map(sideEffect => {
      sideEffect(this.action$).subscribe(action => this.action$.next(action));
    });
  }
}

export function createKunley(initialState) {
  return new Kunley(initialState);
}
