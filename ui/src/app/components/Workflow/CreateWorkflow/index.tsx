import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@material-ui/core';

export namespace CreateWorkflow {
    export interface Props {
        classes?: any
    }
    export interface State {
        dialogCreateNewOpen: boolean
        workFlowName: string
      }
}
export interface State {
    dialogCreateNewOpen: boolean
    workFlowName: string
  }


class CreateWorkflow extends React.Component<CreateWorkflow.Props, CreateWorkflow.State> {

  constructor(props: CreateWorkflow.Props) {
      super(props)
  }
  state: CreateWorkflow.State = {
    dialogCreateNewOpen: false,
    workFlowName: '',
  };
  
  

  handleCreateNewOpen = (open: boolean) => () => {
    this.setState({ dialogCreateNewOpen: open });
};

handleCreateName = (name: keyof CreateWorkflow.State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ workFlowName: event.target.value } );
  };

  render() {

    const { dialogCreateNewOpen, workFlowName } = this.state;
    const { classes } = this.props;

    return (
        <main className={classes.layout}>
            <div className={classes.buttonGroup}>
                <Button variant="contained" onClick={this.handleCreateNewOpen(true)} className={classes.button}>Create New</Button>
                <Button variant="contained" className={classes.button}>Test</Button>
            </div>
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
                    <Button variant="contained" onClick={this.handleCreateNewOpen(false)} className={classes.button}>Create</Button>
                </DialogActions>
            </Dialog>
        </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(CreateWorkflow);