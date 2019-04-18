import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/components/dashboard/DocumentTile';
import { styles } from './styles'

export namespace Dashboard {
	export interface Props {
		classes?: any
		match?: { params: any }
  	}
}

class Dashboard extends React.Component<Dashboard.Props> {

  	constructor(props: Dashboard.Props, context?: any) {
		super(props, context);
  	}

  	render() {


		const { classes } = this.props;
		const documents = ["Document", "Document", "Document", "Document", "Document", "Document", "Document"]
		
		const docList = documents.map((name, i) =>
			<DocumentTile name={name} author="Jacob Brown" workflow="Opinion Desk" duedate="4/20/2019"/>
		);

		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
				<Grid className={classes.outerGrid} container spacing={24}>
					{docList}
				</Grid>
			</React.Fragment>
		);
  }
}

export default withStyles(styles, {withTheme: true})(Dashboard);
