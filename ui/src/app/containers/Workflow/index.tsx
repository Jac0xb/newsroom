import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PrimarySearchAppBar from 'app/components/Common/appbar';
import Grid from '@material-ui/core/Grid';
import WorkflowContents from 'app/components/Workflow/WorkflowContents';
import CreateWorkflow from 'app/components/Workflow/CreateWorkflow';

export namespace Workflow {
	export interface Props extends RouteComponentProps<void> {
		flows: Array<String>
  }
}

export class Workflow extends React.Component<Workflow.Props> {
	static defaultProps: Partial<Workflow.Props> = {
		flows: []
	};

	constructor(props: Workflow.Props, context?: any) {
		super(props, context);
	}

  	render() {
		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
				<Grid item xs={3}>
					<CreateWorkflow />
				</Grid>

				<Grid item xs={12}>
					<Grid container justify="center" spacing={16}>
						{[0, 1, 2].map(value => (
						<Grid key={value} item>
							<WorkflowContents />
						</Grid>
						))}
					</Grid>
				</Grid>
				
			</React.Fragment>
		);
	}
}
