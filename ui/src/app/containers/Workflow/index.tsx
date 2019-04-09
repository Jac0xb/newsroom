import * as React from 'react';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';

export namespace Workflow {
	export interface Props extends RouteComponentProps<void> {
		tasks: Array<String>
  }
}

export class Workflow extends React.Component<Workflow.Props> {
	static defaultProps: Partial<Workflow.Props> = {
		tasks: []
  	};

  	constructor(props: Workflow.Props, context?: any) {
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
