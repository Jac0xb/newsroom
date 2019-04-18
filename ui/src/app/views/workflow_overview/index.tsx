import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import CreateWorkflow from 'app/components/workflow/workflow_overview';

export namespace Workflow {
	export interface Props extends RouteComponentProps<void> {
		classes?: any
  }
}

export class Workflow extends React.Component<Workflow.Props> {
	static defaultProps: Partial<Workflow.Props> = {
	};

	constructor(props: Workflow.Props) {
		super(props);
	}

  	render() {
		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
				<CreateWorkflow/>
			</React.Fragment>
		);
	}
}
