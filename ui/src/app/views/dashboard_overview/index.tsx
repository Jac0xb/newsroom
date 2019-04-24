import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Button, TextField, Typography, Divider, MenuItem } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/components/dashboard/DocumentTile';
import { Document } from 'app/models';
import { styles } from './styles';
import { Link } from 'react-router-dom';
import axios from 'axios';
import _, { keys, toInteger } from 'lodash-es';

enum FilterSetting {
	None,
	Author
}

enum SortSetting {
	None,
	Workflow,
	Priority,
	Author
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
		sortBy: SortSetting,
		filterInput: string
	}
}

class Dashboard extends React.Component<Dashboard.Props, Dashboard.State> {

	constructor(props: Dashboard.Props, context?: any) {
		super(props, context);
		this.state = { documents: [], filter: FilterSetting.None, filterInput: "", sortBy: SortSetting.Workflow }
	}

	componentDidMount() {
		axios.get("/api/documents").then((response) => {
			this.setState({ documents: response.data })
		});
	}

	getSortedAndFilteredDocuments() {
		
		var sortfunc: (d: Document) => any = (d: Document) => "Unfiltered";

		if (this.state.sortBy == SortSetting.Workflow)
			sortfunc = (d) => d.workflow.name;
		else if (this.state.sortBy == SortSetting.Author)
			sortfunc = (d) => d.creator;

		var sortedDocuments = _.groupBy(this.state.documents, sortfunc)
		
		var filterfunc = (d: Document) => true;

		if (this.state.filter == FilterSetting.Author) {
			filterfunc = (d: Document) => d.creator.toLowerCase().includes(this.state.filterInput.toLowerCase());
		}

		return _.map(sortedDocuments, (documentList, key ) => {
			return {key, documents: _.filter(documentList, filterfunc.bind(this))}
		}); 

	}

	render() {

		var sortTypes = [
			{name: "Author", type: SortSetting.Author},
			{name: "Workflow", type: SortSetting.Workflow},
			{name: "Priority", type: SortSetting.Priority},
			{name: "None", type: SortSetting.None}
		]

		const { classes } = this.props;
		const { filter } = this.state;
		const jsxDocuments = _.map(this.getSortedAndFilteredDocuments(), ((docGroup: {key: string, documents: Document[]}) => {
			
			if (docGroup.documents.length == 0) return <div></div>
			
			return (
				<React.Fragment key={docGroup.key}>
					{ (docGroup.key !== "Unfiltered") ?
						<Typography style={{marginLeft:"24px"}} variant={"title"}>
							{docGroup.key}
						</Typography> :
						<div></div>
					}
					<Divider style={{margin:"0 24px"}}/>
					<div className={classes.outerGrid}>
						{
							_.map(docGroup.documents, (document) =>
								<DocumentTile key={document.id} document={document} />
							)
						}
					</div>
				</React.Fragment>
			)
		}));

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
					<form style={{display: "flex"}}>
					<TextField
					className={classes.textField}
					placeholder="Filter Author"
					margin={"none"}
					style={{width: 300, marginRight: "16px"}}
					value={this.state.filterInput}
					disabled={(!filter)}
					onChange={(c) => this.setState({ filterInput: c.target.value })}
					/>
					<Typography variant={"subtitle1"} style={{marginRight: "16px"}}>Sorting</Typography>
					<TextField
					select
					className={classes.textField}
					value={this.state.sortBy}
					margin={"none"}
					onChange={(e) => this.setState({sortBy: parseInt(e.target.value)}) }
					SelectProps={{
						MenuProps: {
						className: classes.menu,
						},
					}}
					>
					{sortTypes.map((item, i) => (
						<MenuItem key={i} value={item.type}>
							{item.name}
						</MenuItem>
					))}
					</TextField>
					</form>
				</div>
				{jsxDocuments}
			</React.Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Dashboard);
