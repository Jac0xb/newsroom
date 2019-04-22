import * as React from 'react';
import {withRouter} from 'react-router';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Grid, Button } from '@material-ui/core';
import { WithStyles } from '@material-ui/styles'
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/components/dashboard/DocumentTile';
import { styles } from './styles';
import { Link } from 'react-router-dom';

export namespace Dashboard {
	export interface Props {
		classes?: any
		history: any
		match?: { params: any }
		location: any
	}
}

// https://stackoverflow.com/questions/37843495/material-ui-adding-link-component-from-react-router/46686467#46686467

class Dashboard extends React.Component<Dashboard.Props> {

	constructor(props: Dashboard.Props, context?: any) {
		super(props, context);
	}

	render() {


		const { classes } = this.props;
		const documents = ["Document", "Document", "Document", "Document", "Document", "Document", "Document"]

		const docList = documents.map((name, i) =>
			<DocumentTile id={i} name={name} author="Jacob Brown" workflow="Opinion Desk" duedate="4/20/2019" />
		);

		return (
			<React.Fragment>
				<PrimarySearchAppBar />
				<div className={classes.buttonGroup}>
				<Link to="/document/create">
					<Button variant={"contained"}>
						Poop
					</Button>
				</Link>
				</div>
				<Grid className={classes.outerGrid} container spacing={24}>
					{docList}
				</Grid>
			</React.Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Dashboard);
