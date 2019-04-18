import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import Grid from '@material-ui/core/Grid';
import WorkflowContents from 'app/components/workflow_overview/WorkflowContents';
import CreateWorkflow from 'app/components/workflow_overview/CreateWorkflow';

export namespace Workflow {
	export interface Props extends RouteComponentProps<void> {
		flows: Array<String>
  }
}

export class Workflow extends React.Component<Workflow.Props> {
	static defaultProps: Partial<Workflow.Props> = {
		flows: [],
	};

	constructor(props: Workflow.Props, context?: any) {
		super(props, context);
	}

  	render() {
		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
				<Grid item xs={3}>
					<CreateWorkflow>
						<WorkflowContents name={"Workflow"}/>
					</CreateWorkflow>

				</Grid>
				
			</React.Fragment>
		);
	}
}
