/*
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import ContentEditable from 'react-contenteditable';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

export namespace DocumentDetails {
    export interface Props {
		classes?: any
		match?: { params: any }
    }
}
class DocumentDetails extends React.Component<DocumentDetails.Props, any> {

	constructor(props: DocumentDetails.Props) {
		super(props)
		this.state = {html : "Text"}
	}

  	render() {
		console.log(this.props)

		return (
			<main className={classes.layout}>
				<Grid container spacing={24}>
					<Grid item xs={9}>
						<Paper className={classes.paper}>
							<ContentEditable className={classes.editor} html={this.state.html} onChange={(e: any) => this.handleChange(e)}>

							</ContentEditable>
						</Paper>

					</Grid>
					<Grid item xs={3}>
						<Paper className={classes.paper}>
							<Typography>
								Workflow View
							</Typography>
							<Divider/>
							<Typography>
								Styles
							</Typography>
							<Divider/>
							<Typography>
								Insert media
							</Typography>
							<Divider/>
							<div className={classes.buttonGroup}>
								<Button variant="contained" className={classes.button}>Back</Button>
								<Button variant="contained" className={classes.button}>Next</Button>
							</div>
						</Paper>
					</Grid>
				</Grid>
		</main>
		);
	}
	  
	handleChange (event : React.ChangeEvent<HTMLInputElement>) {
		this.setState({html: event.target.value});
		console.log(event.target.value)
	};
}

export default withStyles(styles, {withTheme: true})(DocumentDetails);

*/