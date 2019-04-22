import * as React from 'react';
import { Button, Divider, Typography, Paper, Grid } from '@material-ui/core';
import DetailRow from 'app/components/dashboard/DetailLine';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';

export namespace DocumentTile {
	export interface Props {
		classes?: any,
		match?: { params: any },
		document: any
	}
}

class DocumentTile extends React.Component<DocumentTile.Props> {

	constructor(props: DocumentTile.Props, context?: any) {
		super(props, context);
	}

	render() {

		const { classes, document } = this.props;

		return (
			<Grid item>
				<Paper className={classes.documentItem} >
					<Typography variant={"title"}>
						{name}
					</Typography>
					<Divider />
					<table style={{ width: "100%" }}>
						<tbody>
							<DetailRow title="Author" data={document.creator} link={true} />
							<DetailRow title="Workflow Type" data={document.workflow.name} link={true} />
							<DetailRow title="Due Date" data={"duedate"} />
						</tbody>
					</table>
					<div className={classes.buttonGroup}>
						<Link to={"/document/" + document.id + "/editor"}>
							<Button variant="contained" className={classes.button}>Edit</Button>
						</Link>
					</div>
				</Paper>
			</Grid>
		);
	}
}

export default withStyles(styles, { withTheme: true })(DocumentTile);
