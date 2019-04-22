import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Grid } from '@material-ui/core';
import Workflow from 'app/components/workflow/workflow_object';
import axios from 'axios';

export namespace CreateWorkflow {
    export interface Props {
        classes?: any
    }
    export interface State {
        dialogCreateNewOpen: boolean
        workFlowName: string
        workFlowDesc: string
        workflows: Array<any>
    }
}


class CreateWorkflow extends React.Component<CreateWorkflow.Props, CreateWorkflow.State> {

    constructor(props: CreateWorkflow.Props) {
        super(props)
    }

    state: CreateWorkflow.State = {
        dialogCreateNewOpen: false,
        workFlowName: "",
        workFlowDesc: "",
        workflows: [],
    };

    componentDidMount() {
        axios.get("/api/workflows").then((response) => {
            console.log(response);

            this.setState({ workflows: response.data });
        })
    }

    handleCreateNewOpen = (open: boolean) => () => {
        this.setState({ dialogCreateNewOpen: open });
    };

    handleTextBoxesChange = (name: keyof CreateWorkflow.State) => (event: React.ChangeEvent<HTMLInputElement>) => {

        if(name == "workFlowName"){
            this.setState({ workFlowName: event.target.value });
        }
        if(name == "workFlowDesc"){
            this.setState({ workFlowDesc: event.target.value });
        }
    };

    handleCreateNew = () => () => {

        axios.post("/api/workflows", {
            name: this.state.workFlowName,
            creator: "Jacques",
            description: this.state.workFlowDesc,

        }).then((response: any) => {
            console.log(response);

            const workflow = response.data
            this.state.workflows.push(workflow)

            // close dialog, rest text boxes
            this.setState({dialogCreateNewOpen: false, workFlowName: "", workFlowDesc: ""});
        });
    };

    render() {

        const { dialogCreateNewOpen, workFlowName, workFlowDesc, workflows } = this.state;
        const { classes } = this.props;

        return (
            <main className={classes.layout}>
                <div className={classes.buttonGroup}>
                    <Button variant="contained" onClick={this.handleCreateNewOpen(true)} className={classes.button}>Create New</Button>
                </div>
                <Grid item xs={12}>
                    <Grid container justify="center" spacing={16}>
                        {workflows.map(workflow => (
                            <Grid key={workflow.id} item>
                                <Workflow workflow={workflow} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Dialog className={classes.dialog}
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={dialogCreateNewOpen}
                    onClose={this.handleCreateNewOpen(false)}>
                    <DialogTitle id="form-dialog-title">Create New Workflow</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter the name of the new workflow
                    </DialogContentText>
                        <form className={classes.container} noValidate autoComplete="off">
                            <TextField
                                id="workflow-name"
                                label="Name"
                                className={classes.textField}
                                value={workFlowName}
                                onChange={this.handleTextBoxesChange('workFlowName')}
                            />
                            <TextField
                                id="workflow-desc"
                                label="Description"
                                className={classes.textField}
                                value={workFlowDesc}
                                onChange={this.handleTextBoxesChange('workFlowDesc')}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={this.handleCreateNew()} className={classes.button}>Create</Button>
                    </DialogActions>
                </Dialog>
            </main>
        );
    }
}

export default withStyles(styles, { withTheme: true })(CreateWorkflow);