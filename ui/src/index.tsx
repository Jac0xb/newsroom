import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux'
import configureStore from "./app/store";
import { createBrowserHistory } from 'history';
import 'style-loader';
import 'css-loader';
import '../node_modules/antd/dist/antd.css';
import * as ReflectMetadata from 'reflect-metadata';

const history = createBrowserHistory();
const store = configureStore();

ReactDOM.render(
	<Router history={history}>
		<Provider store={store}>
			<App />
		</Provider>
	</Router>,
    document.getElementById('root')
);