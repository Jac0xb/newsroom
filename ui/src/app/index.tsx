import * as React from 'react';

// Nagivational React components that are composed declaratively.
import { Route, Switch } from 'react-router';

// Newsroom the application.
import { Dashboard } from './containers/Dashboard';
import { Workflow } from './containers/Workflow';

// Style-Normalization (https://material-ui.com/style/css-baseline/)
import CssBaseline from '@material-ui/core/CssBaseline';

// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';

export const App = hot(module)(() => (
  <React.Fragment>
    <CssBaseline />
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workflow" component={Workflow} />
    </Switch>
  </React.Fragment>
));
