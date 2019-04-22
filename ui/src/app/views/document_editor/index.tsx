import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import ContentEditable from 'react-contenteditable';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import WorkflowMiniView from 'app/components/workflow/workflow_miniview';
import axios from 'axios';

export namespace EditorContainer {
	export interface Props {
		classes: any
		match: { params: { id: number } }
	}
	export interface State {
		document: Document
	}
}

class EditorContainer extends React.Component<EditorContainer.Props, any> {

	static defaultProps: Partial<EditorContainer.Props> = {
	};

	constructor(props: EditorContainer.Props) {
		super(props)
		this.state = { html: "Text" }
	}

	componentDidMount() {
		const documentId = this.props.match.params.id;

		axios.get("/api/documents/" + documentId).then((response) => {
			console.log(response);

			const document = response.data;

			this.setState({ document: document });
		});
	}

	render() {
		const { classes } = this.props;

		const { document } = this.state;

		if (!document) {
			return null;
		}

		return (
			<React.Fragment>
				<PrimarySearchAppBar />
				<main className={classes.layout}>
					<Grid container spacing={24}>
						<Grid item xs={9}>
							<Paper className={classes.paper}>
								<Typography variant="h4">{document.name}</Typography>
								<ContentEditable
									className={classes.editor} html={document.content || ""}
									onChange={(e: any) => this.handleChange(e)} />
							</Paper>
						</Grid>
						<Grid item xs={3}>
							<Paper className={classes.paper}>
								<Typography>
									Styles
								</Typography>
								<Divider />
								<Typography>
									Insert media
								</Typography>
								<Divider />
								<WorkflowMiniView
									workflow={document.workflow}
									currentStage={document.stage.sequenceId} />
							</Paper>
						</Grid>
					</Grid>
				</main>
			</React.Fragment>
		);
	}

	handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({ html: event.target.value });
		console.log(event.target.value)
	};
}


export default withStyles(styles, { withTheme: true })(EditorContainer);