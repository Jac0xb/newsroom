import * as React from 'react';
import PrimarySearchAppBar from 'app/components/Common/appbar';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import ContentEditable from 'react-contenteditable';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

export namespace EditorContainer {
    export interface Props {
		classes?: any
		match?: { params: any }
	}
}

class EditorContainer extends React.Component<EditorContainer.Props, any> {
	
	static defaultProps: Partial<EditorContainer.Props> = {
	};

	constructor(props: EditorContainer.Props) {
		super(props)
		this.state = {html : "Text"}
	}

  	render() {

		const { classes } = this.props;

		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
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
			</React.Fragment>
		);
	}

	handleChange (event : React.ChangeEvent<HTMLInputElement>) {
		this.setState({html: event.target.value});
		console.log(event.target.value)
	};
}


export default withStyles(styles, {withTheme: true})(EditorContainer);