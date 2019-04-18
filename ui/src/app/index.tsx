import * as React from 'react';

// Nagivational React components that are composed declaratively.
import { Route, Switch } from 'react-router';

// Newsroom the application.
import { Dashboard } from './containers/Dashboard';
import { DocumentContainer } from './containers/Document';
import  EditorContainer from './containers/Editor';
import { Workflow } from './containers/Workflow';

// Style-Normalization (https://material-ui.com/style/css-baseline/)
import CssBaseline from '@material-ui/core/CssBaseline';

// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';

export const App = hot(module)(() => (
  	<React.Fragment>
    	<CssBaseline />
    	<Switch>
			<Route path="/document/:id/editor" component={EditorContainer} />
    		<Route path="/document/:id" component={DocumentContainer} />
      		<Route path="/workflow" component={Workflow} />
      		<Route exact path="/" component={Dashboard} />
		</Switch>
  	</React.Fragment>
));
