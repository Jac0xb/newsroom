import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Grid } from '@material-ui/core';
import WorkflowContents from 'app/components/workflow/workflow_object';
import axios from 'axios';

export namespace CreateWorkflow {
    export interface Props {
        classes?: any
    }
    export interface State {
        dialogCreateNewOpen: boolean
        workFlowName: string
        workflows: Array<any>
    }
}


class CreateWorkflow extends React.Component<CreateWorkflow.Props, CreateWorkflow.State> {

    constructor(props: CreateWorkflow.Props) {
        super(props)
    }

    state: CreateWorkflow.State = {
        dialogCreateNewOpen: false,
        workFlowName: "Workflow Name",
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

    handleCreateName = (name: keyof CreateWorkflow.State) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ workFlowName: event.target.value });
    };

    handleCreateNew = () => () => {

        axios.post("/api/workflows", {
            name: this.state.workFlowName,
            creator: "Jacques"
        }).then((response: any) => {
            console.log(response);

            const workflow = response.data
            this.state.workflows.push(workflow)

            this.setState({
                dialogCreateNewOpen: false,
            });
        });
    };

    render() {

        const { dialogCreateNewOpen, workFlowName, workflows } = this.state;
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
                                <WorkflowContents workflow={workflow} />
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
                                onChange={this.handleCreateName('workFlowName')}
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