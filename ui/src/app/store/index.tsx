import { createStore, combineReducers, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import { workflowReducer } from "./workflow/reducers";
import { dashboardReducer } from "./dashboard/reducers";
import { userReducer } from "./user/reducers";

// Combine all reducers
const rootReducer = combineReducers({
  workflow: workflowReducer,
  dashboard: dashboardReducer,
  user: userReducer,
});

// Create AppState
export type AppState = ReturnType<typeof rootReducer>;

export default function configureStore() {

  // Add middlewares here
  const middlewares = [thunkMiddleware];
  const middleWareEnhancer = applyMiddleware(...middlewares);

  const store = createStore(
    rootReducer,
    composeWithDevTools(middleWareEnhancer)
  );

  return store;
}
