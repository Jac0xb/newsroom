import { createStore, combineReducers, applyMiddleware } from "redux";
// import { composeWithDevTools } from "redux-devtools-extension";

import { workflowReducer } from "./workflow/reducers";

const rootReducer = combineReducers({
  worflow: workflowReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default function configureStore() {

  const store = createStore( rootReducer );

  return store;
}
