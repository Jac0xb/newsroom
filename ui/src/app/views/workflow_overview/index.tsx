import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router';
import PrimarySearchAppBar from 'app/components/common/header';
import WorkflowOverview from 'app/components/workflow/workflow_overview';
import { styles } from './styles';

export namespace Workflow {
	export interface Props extends RouteComponentProps<void> {
		classes?: any
  }
}

class Workflow extends React.Component<Workflow.Props> {
	static defaultProps: Partial<Workflow.Props> = {
	};

	constructor(props: Workflow.Props) {
		super(props);
	}

  	render() {
		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
				<WorkflowOverview/>
			</React.Fragment>
		);
	}
}
export default withStyles(styles, { withTheme: true })(Workflow);
