import * as React from 'react';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';

export namespace App {
	export interface Props extends RouteComponentProps<void> {
		tasks: Array<String>
  }
}

export class App extends React.Component<App.Props> {
	static defaultProps: Partial<App.Props> = {
		tasks: []
  	};

  	constructor(props: App.Props, context?: any) {
		super(props, context);
  	}

  	render() {

	return (
	  	<div className={style.normal}>
			Hello World!
	  	</div>
	);
  }
}
