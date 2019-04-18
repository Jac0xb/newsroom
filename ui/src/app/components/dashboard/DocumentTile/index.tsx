import * as React from 'react';
import { Button, Divider, Typography, Paper, Grid } from '@material-ui/core';
import DetailRow from 'app/components/dashboard/DetailLine';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';

export namespace Dashboard {
	export interface Props {
		classes?: any,
		match?: { params: any },
		name: string,
		author: string,
		duedate: string,
		workflow: string
	  }
	  export interface DetailLineProps {
		  classes?: any
	  }
}

class Dashboard extends React.Component<Dashboard.Props> {

  	constructor(props: Dashboard.Props, context?: any) {
		super(props, context);
  	}

  	render() {
		
		const { classes, name, author, workflow, duedate } = this.props;

		return (
			<Grid item md={3}>
				<Paper className={classes.documentItem} >
					<Typography variant={"title"}> 
						{name}
					</Typography>
					<Divider/>
					<table style={{width: "100%"}}>
						<DetailRow title="Author" data={author} link={true} />
						<DetailRow title="Workflow Type" data={workflow} link={true} />
						<DetailRow title="Due Date" data={duedate} />
					</table>
					<div className={classes.buttonGroup}>
						<Button variant="contained" className={classes.button}>Edit</Button>
					</div>
				</Paper>
			</Grid>
		);
  	}
}

export default withStyles(styles, {withTheme: true})(Dashboard);
