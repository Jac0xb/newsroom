import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import { Router } from 'react-router-dom';

import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

ReactDOM.render(
	<Router history={history}>
	<App />
	</Router>,
    document.getElementById('root')
);