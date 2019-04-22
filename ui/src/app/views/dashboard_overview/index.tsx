import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Grid, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/components/dashboard/DocumentTile';
import { styles } from './styles';
import { Link } from 'react-router-dom';
import axios from 'axios';

export namespace Dashboard {
	export interface Props {
		classes?: any
		history: any
		match?: { params: any }
		location: any
	}
	export interface State {
		documents: any[]
	}
}

// https://stackoverflow.com/questions/37843495/material-ui-adding-link-component-from-react-router/46686467#46686467

class Dashboard extends React.Component<Dashboard.Props, Dashboard.State> {

	constructor(props: Dashboard.Props, context?: any) {
		super(props, context);
		this.state = {documents: []}
	}

	componentDidMount() {
		//const id = this.props.match.params.id;
	
		axios.get("/api/documents").then((response) => {
		  console.log(response.data);
	
		  const documents = response.data;
	
		  this.setState({ documents })
		});
	}

	render() {


		const { classes } = this.props;
		const { documents } = this.state;

		const docList = documents.map((document, i) =>
			<DocumentTile key={i} document={document} />
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
