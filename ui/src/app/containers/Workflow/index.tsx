import * as React from 'react';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';
import PrimarySearchAppBar from 'app/components/Common/appbar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';

export namespace Workflow {
	export interface Props extends RouteComponentProps<void> {
		flows: Array<String>
  }
}

export class Workflow extends React.Component<Workflow.Props> {
	static defaultProps: Partial<Workflow.Props> = {
		flows: []
	};
	state = {
		dialogCreateNewOpen: false,
	  };
	constructor(props: Workflow.Props, context?: any) {
		super(props, context);
	}

	handleCreateNewOpen = (open: boolean) => () => {
		this.setState({ dialogCreateNewOpen: open });
	};

  	render() {
		console.log("workflow");
		const { dialogCreateNewOpen } = this.state;
		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
				<Grid container spacing={24}>
        			<Grid item sm={12}>
						<Button variant="contained" onClick={this.handleCreateNewOpen(true)}>Create New</Button>
						<Dialog
							disableBackdropClick
							disableEscapeKeyDown
							open={dialogCreateNewOpen}
							onClose={this.handleCreateNewOpen(false)}
							></Dialog>
					</Grid>
					<Grid item sm={12}>
					<div className={style.normal}>
						Hello World!
					</div>
					</Grid>
				</Grid>
			</React.Fragment>
		);
	}
}
