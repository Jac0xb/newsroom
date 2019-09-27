import { createStore, combineReducers, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import { workflowReducer } from "./workflow/reducers";

// Combine all reducers
const rootReducer = combineReducers({
  workflow: workflowReducer
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
