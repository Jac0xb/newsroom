import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import StyleBar from 'app/components/common/style_bar';
import WorkflowMiniView from 'app/components/workflow/workflow_miniview';
import { Document } from 'app/models';
import axios from 'axios';
import { Editor, EditorState, RichUtils, convertFromRaw, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import * as React from 'react';
import { styles } from './styles';


export namespace EditorContainer {
	export interface Props {
		classes: any
		match: { params: { id: number } }
	}
	export interface State {
		document?: Document
		editorState: EditorState
		styleBarUpdateFormats?: (formats: string[]) => void
	}
}

class EditorContainer extends React.Component<EditorContainer.Props, any> {
	documentId: number

	state: EditorContainer.State = {
		editorState: EditorState.createEmpty()
	}

	constructor(props: EditorContainer.Props) {
		super(props)
		this.documentId = props.match.params.id;
	}

	componentDidMount() {
		const documentId = this.props.match.params.id;

		axios.get("/api/documents/" + documentId).then((response) => {
			console.log(response);

			const document = response.data;

			let editorState: EditorState
			try {
				editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(document.content)));
			} catch (e) {
				editorState = EditorState.createEmpty();
			}

			this.setState({
				document: document,
				editorState: editorState
			});
		});
	}

	render() {
		const { classes } = this.props;

		const { document, editorState } = this.state;

		if (!document || !document.workflow || !document.stage) {
			return <div>Document did not exist, had no workflow, or had no stage</div>;
		}

		return (
			<React.Fragment>
				<PrimarySearchAppBar />
				<main className={classes.layout}>
					<Grid container spacing={24}>
						<Grid item xs={9}>
							<Paper className={classes.documentTitlePaper}>
								<Typography variant="h4">{document.name}</Typography>
							</Paper>
							<Paper className={classes.paper}>
								<Editor editorState={editorState}
									onChange={(editorState: EditorState) => this.handleChange(editorState)}
									handleKeyCommand={(command: string, editorState: EditorState) => this.handleKeyCommand(command, editorState)} />
							</Paper>
						</Grid>
						<Grid item xs={3}>
							<Paper className={classes.paper}>
								<Typography>
									Styles
								</Typography>
								<StyleBar
									onClick={(format) => this.handleFormatChange(format)}
									onCreateUpdateFormats={(updateFormats) => this.state.styleBarUpdateFormats = updateFormats} />
								<Divider />
								<WorkflowMiniView
									workflow={document.workflow}
									currentStage={document.stage.sequenceId!}
									onMove={(direction) => this.handleMove(direction)} />
							</Paper>
						</Grid>
					</Grid>
				</main>
			</React.Fragment>
		);
	}

	saveContent(editorState: EditorState) {
		const rawJson = JSON.stringify(convertToRaw(editorState.getCurrentContent()));

		axios.put("/api/documents/" + this.props.match.params.id, {
			content: rawJson
		}).then((response) => {
			console.log(response);
		});
	}

	handleChange(editorState: EditorState) {
		const updateFormats = this.state.styleBarUpdateFormats;
		if (updateFormats) {
			updateFormats(editorState.getCurrentInlineStyle().toArray());
		}

		this.setState({ editorState: editorState });

		this.saveContent(editorState);
	}

	handleFormatChange(format: string) {
		this.handleChange(RichUtils.toggleInlineStyle(this.state.editorState, format));
	}

	handleKeyCommand(command: string, editorState: EditorState) {
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.handleChange(newState);
			return 'handled';
		}

		return 'not-handled';
	}

	handleMove(direction: string) {
		axios.put("/api/documents/" + this.documentId + "/" + direction).then((response) => {
			console.log(response);
			this.setState({ document: response.data })
		});
	}
}

export default withStyles(styles, { withTheme: true })(EditorContainer);