import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Grid } from '@material-ui/core';
import WorkflowContents from 'app/components/workflow/workflow_object';

export namespace CreateWorkflow {
    export interface Props {
        classes?: any
    }
    export interface State {
        dialogCreateNewOpen: boolean
        workFlowName: string
        workFlowContents: Array<any>
        workFlowContentsCount: number
      }
}


class CreateWorkflow extends React.Component<CreateWorkflow.Props, CreateWorkflow.State> {

  constructor(props: CreateWorkflow.Props) {
      super(props)
  }
  state: CreateWorkflow.State = {
    dialogCreateNewOpen: false,
    workFlowName: "Workflow Name",
    workFlowContents: [],
    workFlowContentsCount: 0,
  };

  handleCreateNewOpen = (open: boolean) => () => {
      this.setState({ dialogCreateNewOpen: open });
  };
  
  handleCreateName = (name: keyof CreateWorkflow.State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ workFlowName: event.target.value } );
  };

  handleCreateNew = () => () => {
    this.state.workFlowContentsCount++;
    this.state.workFlowContents.push(<WorkflowContents id={this.state.workFlowContentsCount} name={this.state.workFlowName} onClick={(id: number) => this.handleClick(id)}/>)
    
    this.setState({ dialogCreateNewOpen: false} );
  };

  handleClick (id : number) {
    //window.location.href += "/id:" + id + "/edit"
    window.location.href += "/id:/edit"
    console.log(id)
};

  render() {

    const { dialogCreateNewOpen, workFlowName, workFlowContents } = this.state;
    const { classes } = this.props;

    return (
        <main className={classes.layout}>
            <div className={classes.buttonGroup}>
                <Button variant="contained" onClick={this.handleCreateNewOpen(true)} className={classes.button}>Create New</Button>
            </div>
            <Grid item xs={12}>
                <Grid container justify="center" spacing={16}>
                    {workFlowContents.map(instance => (
                    <Grid key={instance.props.id} item>
                        {instance}
                    </Grid>
                    ))}
                </Grid>
            </Grid>
            <Dialog className={classes.dialog}
                disableBackdropClick
                disableEscapeKeyDown
                open={dialogCreateNewOpen}
                onClose={this.handleCreateNewOpen(false)}
                >
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

export default withStyles(styles, {withTheme: true})(CreateWorkflow);