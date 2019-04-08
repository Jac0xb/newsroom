import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PrimarySearchAppBar from 'app/components/Common'

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
			<div>
				<PrimarySearchAppBar/>
			</div>
		);
  }
}
