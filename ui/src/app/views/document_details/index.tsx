import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import SectionItem from 'app/components/common/section_item';
import Button from '@material-ui/core/Button';
import PrimarySearchAppBar from 'app/components/common/application_bar'

export namespace DocumentDetails {
    export interface Props {
		classes?: any
		match?: { params: any }
    }
}
class DocumentDetails extends React.Component<DocumentDetails.Props, any> {

	constructor(props: DocumentDetails.Props) {
		super(props)
	}

  	render() {
		console.log(this.props)
    const { classes } = this.props;
//Document Details for {match!.params ? match!.params.id : "" }
    return (
		<React.Fragment>
			<PrimarySearchAppBar/>
			<main className={classes.layout}>
				<Paper className={classes.paper}>
					<Typography className={classes.heading} variant="h4">
					</Typography>
					<Divider/>
					<SectionItem heading={"Name"} description={"Description"} />
					<SectionItem heading={"Created Date"} description={"4/11/2019 2:09 PM"} />
					<SectionItem heading={"Content Preview"} description={"Happy ".repeat(255)} />
					<div className={classes.buttonGroup}>
						<Button variant="contained" className={classes.button}>View Content</Button>
						<Button variant="contained" className={classes.button}>Edit</Button>
					</div>
				</Paper>
		</main>
	  </React.Fragment>
    );
  }
}

export default withStyles(styles, {withTheme: true})(DocumentDetails);