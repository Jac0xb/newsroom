import * as React from 'react';

// Nagivational React components that are composed declaratively.
import { Route, Switch } from 'react-router-dom';

// Newsroom the application.
import Dashboard from './views/dashboard_overview';
import DocumentEditor from './views/document_editor';
import WorkflowEditor from './views/workflow_editor'
import { Workflow } from './views/workflow_overview';
import DocumentCreator from './views/document_create';

// Style-Normalization (https://material-ui.com/style/css-baseline/)
import CssBaseline from '@material-ui/core/CssBaseline';

// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';
import Users from "app/views/users";

export const App = hot(module)(() => (
    <React.Fragment>
        <CssBaseline/>
        <Switch>
            <Route exact path="/document" component={Dashboard}/>
            <Route exact path="/document/create" component={DocumentCreator}/>
            <Route path="/document/:id/edit" component={DocumentEditor}/>
            <Route path="/workflow/:id/edit" component={WorkflowEditor}/>
            <Route path="/workflow" component={Workflow}/>
            <Route path="/users" component={Users}/>
            <Route exact path="/" component={Dashboard}/>
        </Switch>
    </React.Fragment>
));


// https://stackoverflow.com/questions/37843495/material-ui-adding-link-component-from-react-router/46686467#46686467