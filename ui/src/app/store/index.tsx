import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { workflowReducer } from './workflow/reducers';
import { dashboardReducer } from './dashboard/reducers';
import { userReducer } from './user/reducers';
import { groupCreateReducer } from './group_create/reducers';
import { apiMiddleware } from 'redux-api-middleware';

// Combine all reducers
const rootReducer = combineReducers({
    workflow: workflowReducer,
    dashboard: dashboardReducer,
    user: userReducer,
    groupCreate: groupCreateReducer
});

// Create AppState
export type AppState = ReturnType<typeof rootReducer>;

export default function configureStore() {

  const middlewares = [thunkMiddleware, apiMiddleware];
  const middleWareEnhancer = applyMiddleware(...middlewares);

  const store = createStore(
    rootReducer,
    composeWithDevTools(middleWareEnhancer)
  );

  return store;
}
