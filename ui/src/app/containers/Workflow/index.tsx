import * as React from 'react';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';

export namespace Dashboard {
	export interface Props extends RouteComponentProps<void> {
		tasks: Array<String>
  }
}

export class Dashboard extends React.Component<Dashboard.Props> {
	static defaultProps: Partial<Dashboard.Props> = {
		tasks: []
  	};

  	constructor(props: Dashboard.Props, context?: any) {
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
