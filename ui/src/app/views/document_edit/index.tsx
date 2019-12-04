import { NRDocument, NRWorkflow } from 'app/utils/models';
import WorkflowMiniView from 'app/views/document_edit/components/WorkflowMiniview';
import axios from 'axios';
import * as React from 'react';

import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { styles } from './styles';
import Sidebar from './components/Sidebar';

export namespace EditorContainer {
    export interface Props {
        classes: any
        match: { params: { id: number } }
    }

    export interface State {
        document?: NRDocument;
        styleBarUpdateFormats?: (formats: string[]) => void;
        errorText?: string;
        iFrameKey: number;
        workflow?: NRWorkflow;
        sidebarToggled: boolean;
    }
}

class EditorContainer extends React.Component<EditorContainer.Props, EditorContainer.State> {

    constructor(props: EditorContainer.Props) {
        super(props)
        this.state = {iFrameKey: Math.random(), sidebarToggled: false};
    }

    componentDidMount() {

        const id = this.props.match.params.id;

        var task = async () => {

            var {data: document} = await axios.get<NRDocument>("/api/documents/" + id)
            var {data: workflow} = await axios.get<NRWorkflow>("/api/workflows/" + document.workflow.id)
            
            this.setState({document, workflow});

        };

        task();
    }

    render() {
        const {classes} = this.props;
        const {document, iFrameKey, workflow} = this.state;

        if (!document || !document.workflow || !document.stage) {
            return <div>Document did not exist, had no workflow, or had no stage</div>;
        }

        if (document.stage.permission == 0) {
            return <Paper className={classes.documentTitlePaper}>
                <Typography variant="h5">
                    You do not have permissions to editing this document.
                </Typography>
            </Paper>
        }

        return (
            <React.Fragment>    
                <Sidebar
                    closed={this.state.sidebarToggled}
                    onToggle={() => this.setState({sidebarToggled: !this.state.sidebarToggled})}
                    workflow={workflow}
                    currentStage={document.stage.sequenceId!}
                    onMove={(direction: string) => this.handleMove(direction)}
                    googleID={document.googleDocId}
                >
                </Sidebar>
                <div style={{padding: "8px"}}>
                    <Paper style={{display:"flex", margin: "16px", marginRight: (this.state.sidebarToggled)? "calc(64px + 16px)" : "calc(167px + 32px + 16px + 64px)", height: "calc(100vh - 64px - 64px + 16px)", padding: "16px"}}>
                        <iframe style={{width: "100%"}}
                                key={iFrameKey}
                                src={`https://docs.google.com/document/d/${document.googleDocId}/edit`}>
                        </iframe>
                    </Paper>
                </div>
            </React.Fragment>
        );
    }

    saveContent() {
    }

    async handleMove(direction: string) {

        if (!this.state.document)
            return;

        var reponse = await axios.put("/api/documents/" + this.state.document.id + "/" + direction);

        var {data: document} = await axios.get<NRDocument>("/api/documents/" + this.state.document.id);
        this.setState({document: document, iFrameKey: Math.random()});

    }

    handleDocumentNameChange(event: React.ChangeEvent<any>) {
        const name = event.target.value;

        const id = this.props.match.params.id;

        if (name.trim().length === 0) {
            this.setState({errorText: "Name must not be empty"})
        } else {
            // this.setState({ errorText: null });

            if (this.state.document) {
                this.state.document.name = name
            }

            axios.put(`/api/documents/${id}`, {
                name: name
            }).then((response) => {
                console.log(response);

                this.setState({iFrameKey: Math.random()})
            });
        }
    }
}

export default withStyles(styles, {withTheme: true})(EditorContainer);