import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Grid } from '@material-ui/core';
import WorkflowContents from 'app/components/Workflow/WorkflowContents';

export namespace CreateWorkflow {
    export interface Props {
        classes?: any
    }
    export interface State {
        dialogCreateNewOpen: boolean
        workFlowName: string
        workFlowContents: Array<any>
      }
}


class CreateWorkflow extends React.Component<CreateWorkflow.Props, CreateWorkflow.State> {

  constructor(props: CreateWorkflow.Props) {
      super(props)
  }
  state: CreateWorkflow.State = {
    dialogCreateNewOpen: false,
    workFlowName: '',
    workFlowContents: [],
  };

  handleCreateNewOpen = (open: boolean) => () => {
      this.setState({ dialogCreateNewOpen: open });
  };
  
  handleCreateName = (name: keyof CreateWorkflow.State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ workFlowName: event.target.value } );
  };

  handleCreateNew = () => () => {

    this.state.workFlowContents.push(<WorkflowContents/>)
    // <WorkflowContents name="">

    this.setState({ dialogCreateNewOpen: false} );
  };

  render() {

    const { dialogCreateNewOpen, workFlowName, workFlowContents } = this.state;
    const { classes, children } = this.props;

    for(var i = 0; i < workFlowContents.length; i++){

    }

    return (
        <main className={classes.layout}>
            <div className={classes.buttonGroup}>
                <Button variant="contained" onClick={this.handleCreateNewOpen(true)} className={classes.button}>Create New</Button>
                <Button variant="contained" className={classes.button}>Test</Button>
            </div>
            <Grid item xs={12}>
                <Grid container justify="center" spacing={16}>
                    {workFlowContents.map(value => (
                    <Grid item>
                        {children}
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
                <DialogTitle id="form-dialog-title">Title</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Content text
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