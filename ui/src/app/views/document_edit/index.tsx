import { NRDocument } from 'app/utils/models';
import WorkflowMiniView from 'app/views/document_edit/components/WorkflowMiniview';
import axios from 'axios';
import * as React from 'react';

import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { styles } from './styles';

export namespace EditorContainer {
	export interface Props {
		classes: any
		match: { params: { id: number } }
	}
	export interface State {
		document?: NRDocument
		styleBarUpdateFormats?: (formats: string[]) => void
		errorText?: string
	}
}

class EditorContainer extends React.Component<EditorContainer.Props, EditorContainer.State> {

	constructor(props: EditorContainer.Props) {
		super(props)
        this.state = { };
	}

	componentDidMount() {

		const id = this.props.match.params.id;

		axios.get("/api/documents/" + id).then((response) => {
			console.log(response);

            const document = response.data;
			this.setState({
				document: document
			});
		});
	}

	render() {
		const { classes } = this.props;
		const { document } = this.state;

		if (!document || !document.workflow || !document.stage) {
			return <div>Document did not exist, had no workflow, or had no stage</div>;
		}

        return (
            <main className={classes.main}>
                <Grid container spacing={4}>
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
                            <iframe style={{width: "100%", height: "900px"}} src={`https://docs.google.com/document/d/${document.googleDocId}/edit`}>

                            </iframe>
                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <WorkflowMiniView
                            workflow={document.workflow}
                            currentStage={document.stage.sequenceId!}
                            onMove={(direction: string) => this.handleMove(direction)} />
                    </Grid>
                </Grid>
            </main>
		);
	}

	saveContent() {
	}

	handleMove(direction: string) {
		axios.put("/api/documents/" + this.state.document.id + "/" + direction).then((response) => {
			console.log(response);
			this.setState({ document: response.data })
		});
	}

	handleDocumentNameChange(event: React.ChangeEvent<any>) {
		const name = event.target.value;

        const id = this.props.match.params.id;

		if (name.trim().length === 0) {
			this.setState({ errorText: "Name must not be empty" })
		} else {
			// this.setState({ errorText: null });

			if (this.state.document) {
				this.state.document.name = name
			}

			axios.put(`/api/documents/${id}`, {
				name: name
			}).then((response) => {
				console.log(response);
			});
		}
	}
}

export default withStyles(styles, { withTheme: true })(EditorContainer);