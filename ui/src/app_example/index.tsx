import * as React from 'react';

// Nagivational React components that are composed declaratively.
import { Route, Switch } from 'react-router';

// Newsroom the application.
import { App as NewsroomApp } from 'app_example/containers/App';

// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';

export const App = hot(module)(() => (
  <Switch>
    <Route path="/" component={NewsroomApp} />
  </Switch>
));
