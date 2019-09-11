import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import StyleBar from 'app/views/document_editor/components/StyleBar'
import WorkflowMiniView from 'app/views/document_editor/components/WorkflowMiniview';
import { Document } from 'app/models';
import axios from 'axios';
import { convertFromRaw, convertToRaw, Editor, EditorState, RichUtils } from 'draft-js';
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
		editorURL: string
		styleBarUpdateFormats?: (formats: string[]) => void
		errorText?: string
	}
}

class EditorContainer extends React.Component<EditorContainer.Props, any> {
	documentId: number

	constructor(props: EditorContainer.Props) {
		super(props)
        this.documentId = props.match.params.id;
        this.state = {
            editorURL: "https://docs.google.com/document/d/1vMvYBaN3CMTAYB56DP4d8yNHTVRTltH5qbP3Wmh7ksc/edit"
        }
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

		const { document, editorURL } = this.state;

		if (!document || !document.workflow || !document.stage) {
			return <div>Document did not exist, had no workflow, or had no stage</div>;
		}

		return (
			<React.Fragment>
				<main className={classes.layout}>
					<Grid container spacing={24}>
						<Grid item xs={9}>
							<Paper className={classes.documentTitlePaper}>
								<Typography variant="h5">
									<TextField
										fullWidth
										id="document-name"
										label="Document Name"
										placeholder="Document Name"
										className={classes.documentTitleTextField}
										margin="normal"
										defaultValue={document.name}
										onChange={(event) => this.handleDocumentNameChange(event)}
										error={!!this.state.errorText} />
								</Typography>
							</Paper>
							<Paper className={classes.editor}>
                                <iframe style={{width: "100%", height: "800px" }} src={editorURL}>

                                </iframe>
							</Paper>
						</Grid>
						<Grid item xs={3}>
							<WorkflowMiniView
								workflow={document.workflow}
								currentStage={document.stage.sequenceId!}
								onMove={(direction:string) => this.handleMove(direction)} />
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

	handleDocumentNameChange(event: React.ChangeEvent<any>) {
		const name = event.target.value;

		if (name.trim().length === 0) {
			this.setState({ errorText: "Name must not be empty" })
		} else {
			this.setState({ errorText: null });

			if (this.state.document) {
				this.state.document.name = name
			}

			axios.put("/api/documents/" + this.documentId, {
				name: name
			}).then((response) => {
				console.log(response);
			});
		}
	}
}

export default withStyles(styles, { withTheme: true })(EditorContainer);