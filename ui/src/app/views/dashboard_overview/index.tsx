import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Button, Divider, Typography, Paper, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Link } from '@material-ui/icons';
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
			<Grid item md={3}>
				<Paper className={classes.documentItem} >
					<Typography variant={"title"}> 
						{`${name} ${i+1}`}
					</Typography>
					<Divider/>
					<Typography className={classes.detailLine} variant={"subtitle1"}> 
						<span style={{fontWeight: "bold"}}>Author</span>:
						<a className={classes.detailLine} href="/users/jacobbrown">
							&nbsp;Jacob Brown
							<Link className={classes.linkIcon}/>
						</a>
					</Typography>
					<Typography className={classes.detailLine} variant={"subtitle1"}> 
					<span style={{fontWeight: "bold"}}>Workflow</span>:
						<a className={classes.detailLine} href="/workflows/abc123">
							&nbsp;Opinion Desk Submission 
							<Link className={classes.linkIcon}/>
						</a>
					</Typography>
					<Typography className={classes.detailLine} variant={"subtitle1"}> 
					<span style={{fontWeight: "bold"}}>Due Date</span>:
						4/20/2019
					</Typography>
					<div className={classes.buttonGroup}>
						<Button variant="contained" className={classes.button}>Edit</Button>
					</div>
				</Paper>
			</Grid>
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
