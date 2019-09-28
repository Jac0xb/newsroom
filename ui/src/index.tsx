import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';
import { Router } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import { Provider } from 'react-redux'
import configureStore from "./app/store";
const store = configureStore();

import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

ReactDOM.render(
	<Router history={history}>
		<Provider store={store}>
			<App />
		</Provider>
	</Router>,
    document.getElementById('root')
);