import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from  '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { styles } from './styles'
import { withStyles } from '@material-ui/core/styles';

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
		const documents = ["Document","Document","Document","Document","Document", "Document","Document"]
		
		const docList = documents.map((name, i) =>
			<Grid item md={3}>
				<Paper className={classes.documentItem} >
					<Typography variant={"title"}> 
						{`${name} ${i+1}`}
					</Typography>
					<Divider/>
					<Typography> 
						Hello
					</Typography>
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
