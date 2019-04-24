import * as React from 'react';
import { Button, Divider, Typography, Paper, Grid } from '@material-ui/core';
import DetailRow from 'app/components/dashboard/DetailLine';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { Document } from 'app/models';
import classNames from 'classnames';
import axios from 'axios';

export namespace DocumentTile {
	export interface Props {
		classes?: any,
		match?: { params: any },
		document: Document
	}
}

class DocumentTile extends React.Component<DocumentTile.Props> {

	constructor(props: DocumentTile.Props, context?: any) {
		super(props, context);
	}

	onDeleteClick = (docID: number) => {
	
		console.log(docID);
		axios.delete("/api/documents/" + docID  , {
		}).then((response) => {
	
		  console.log(response);

		  // re-render??
		  
		});
		
	  };
	
	render() {

		const { classes, document } = this.props;

		return (
			<Paper className={classNames(classes.documentItem, classes.flexAutosize)} >
				<Typography variant={"title"} className={classes.noWrap}>
					{document.name}
				</Typography>
				<Divider />
				<DetailRow title="Author" data={document.creator} link={"/users/" + document.creator} />
				<DetailRow title="Workflow Type" data={document.workflow.name} link={"/workflow/" + document.workflow.id + "/edit"} />
				<DetailRow title="Due Date" data={"duedate"} />
				<div className={classes.buttonGroup}>
					<Link to={"/document/" + document.id + "/edit"}>
						<Button variant="contained" className={classes.button}>Edit</Button>
					</Link>
					<Button variant="contained" className={classes.button} onClick={() => this.onDeleteClick(document.id)}>Delete</Button>
				</div>
			</Paper>
		);
	}
}

export default withStyles(styles, { withTheme: true })(DocumentTile);
