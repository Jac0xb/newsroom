import * as React from 'react';

// Nagivational React components that are composed declaratively.
import { Route, Router, Switch, withRouter } from 'react-router-dom';

// Newsroom the application.
import Dashboard from './views/dashboard_overview';
import DocumentEditor from './views/document_editor';
import WorkflowEditor from './views/workflow_editor'
import { Workflow } from './views/workflow_overview';
import DocumentCreator from './views/document_create';

import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

// Style-Normalization (https://material-ui.com/style/css-baseline/)
import CssBaseline from '@material-ui/core/CssBaseline';

// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';

export const App = hot(module)(() => (
	<Router history={history}>
		<React.Fragment>
			<CssBaseline />
			<Switch>
				<Route exact path="/document" component={Dashboard} />
				<Route exact path="/document/create" component={DocumentCreator} />
				<Route path="/document/:id/editor" component={DocumentEditor} />
				<Route path="/workflow/:id/edit" component={WorkflowEditor} />
				<Route path="/workflow" component={Workflow} />
				<Route exact path="/" component={Dashboard} />
			</Switch>
		</React.Fragment>
	</Router>
));
