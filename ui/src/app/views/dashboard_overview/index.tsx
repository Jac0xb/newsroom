import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Button, TextField } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/components/dashboard/DocumentTile';
import { Document } from 'app/models';
import { styles } from './styles';
import { Link } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash-es';
import { isNullOrUndefined } from 'util';

enum FilterSetting {
	None,
	Author,
	Priority
}

export namespace Dashboard {
	export interface Props {
		classes?: any
		history: any
		match?: { params: any }
		location: any,
	}
	export interface State {
		documents: Document[],
		filter: FilterSetting,
		filterInput: string
	}
}

class Dashboard extends React.Component<Dashboard.Props, Dashboard.State> {

	constructor(props: Dashboard.Props, context?: any) {
		super(props, context);
		this.state = { documents: [], filter: FilterSetting.None, filterInput: "" }
	}

	componentDidMount() {
		//const id = this.props.match.params.id;

		axios.get("/api/documents").then((response) => {

			const documents = response.data;

			this.setState({ documents })
		});
	}

	render() {


		const { classes } = this.props;
		const { documents, filterInput, filter } = this.state;
		
		var filterfunc = (d: Document) => true

		if (this.state.filter == FilterSetting.Author)
			filterfunc = (d: Document) => {
				return d.creator.toLowerCase().includes(filterInput.toLowerCase())
			};
		
		var filteredDocument = _.filter(documents, filterfunc);

		const jsxDocuments = filteredDocument.map((document: Document, i: number) =>
			<DocumentTile key={i} document={document} />
		);

		return (
			<React.Fragment>
				<PrimarySearchAppBar />
				<div className={classes.buttonGroup}>
					<Link style={{ textDecoration: "none" }} to="/document/create">
						<Button style={{ width: "calc(3*52px)" }} variant={"contained"}>
							New Document
						</Button>
					</Link>
					<Button variant={(filter == FilterSetting.None) ?  "outlined" : "contained"} 
							color={(filter == FilterSetting.None) ?  "inherit" : "primary"} 
							onClick={()=>this.setState({filter: (filter == FilterSetting.Author) ? FilterSetting.None : FilterSetting.Author})}
							>
							<AccountCircleIcon />
					</Button>
					<form>
					<TextField
					className={classes.textField}
					placeholder="Filter Author"
					margin="normal"
					value={this.state.filterInput}
					onChange={(c) => this.setState({ filterInput: c.target.value })}
					/>
					</form>
				</div>
				<div className={classes.outerGrid}>
					{jsxDocuments}
				</div>
			</React.Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Dashboard);
