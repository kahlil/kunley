import { createKunley } from './kunley';
import { skip, map, filter } from 'rxjs/operators';
import test from 'ava';

test('kunley.action$', t => {
  t.plan(2);
  const kunley = createKunley(1);
  const dispatcher$ = kunley.action$;
  t.is(
    typeof dispatcher$.next,
    'function',
    'The dispatcher stream has a next function.'
  );
  t.is(
    typeof dispatcher$.subscribe,
    'function',
    'The dispatcher stream has a subscribe function.'
  );
});

// @ts-ignore
test('dispatch()', t => {
  t.plan(1);
  const kunley = createKunley(1);
  const actionOne = payload => ({
    type: 'ACTION_ONE',
    reducer: state => state + payload,
  });
  const return$ = kunley.action$.pipe(skip(1)).subscribe(action => {
    t.is(action.type, actionOne(1).type, 'Correct action is dispatched.');
  });
  t.log(actionOne(1));
  kunley.dispatch(actionOne(1));
  return return$;
});

// @ts-ignore
test('runSideEffects()', t => {
  t.plan(1);
  const kunley = createKunley(1);
  const sideEffect = action$ =>
    action$.pipe(
      filter(({ type }) => type === 'INIT'),
      map(() => ({ type: 'FX_ACTION' }))
    );
  kunley.runSideEffects(sideEffect);
  return kunley.action$
    .pipe(filter(({ type }) => type === 'FX_ACTION'))
    .subscribe(({ type }) =>
      t.is(type, 'FX_ACTION', 'Correct state is created.')
    );
});
