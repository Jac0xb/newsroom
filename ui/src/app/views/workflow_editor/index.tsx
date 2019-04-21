import { Dialog, Fab, Grid, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import WorkflowStage from 'app/components/workflow/workflow_stage';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';

export namespace WorkflowEditor {
  export interface Props {
    classes?: any
    match: {
      params: {
        id: number
      }
    }
  }
  export interface State {
    stages: Array<any>
    dialogCreateNewOpen: boolean
    newStageName: string
  }
}
class WorkflowEditor extends React.Component<WorkflowEditor.Props, WorkflowEditor.State, any> {

  constructor(props: WorkflowEditor.Props) {
    super(props)
  }

  state: WorkflowEditor.State = {
    stages: [],
    dialogCreateNewOpen: false,
    newStageName: ""
  }

  componentDidMount() {
    const id = this.props.match.params.id;

    axios.get("/api/workflows/" + id + "/stages").then((response) => {
      console.log(response);

      const stages = response.data;

      this.setState({ stages: stages })
    })
  }

  handleOpenNewDialog(open: boolean) {
    this.setState({ dialogCreateNewOpen: open });
  };

  handleCreateName = (name: keyof WorkflowEditor.State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newStageName: event.target.value });
  };

  handleAddNew = () => {
    const id = this.props.match.params.id;

    axios.post("/api/workflows/" + id + "/stages", {
      name: this.state.newStageName,
      creator: "Jacques"
    }).then((response) => {
      console.log(response);

      this.state.stages.push(response.data)

      this.setState({
        dialogCreateNewOpen: false
      });
    });
  };

  handleClick = (id: number) => {
    console.log(id)
  };

  render() {

    const { classes } = this.props;
    const { stages, dialogCreateNewOpen, newStageName } = this.state;

    return (
      <React.Fragment>
        <PrimarySearchAppBar />
        <main className={classes.layout}>
          <Grid container spacing={16}>
            {stages.map((stage, index) => (
              <div className={classes.stagePlusButton}>
                <Grid key={index} className={classes.stageGrid} item>
                  <WorkflowStage id={stage.id} name={"Stage"} onClick={(id: number) => this.handleClick(id)} />
                </Grid>
              </div>
            ))}
            <Fab size="small" color="secondary" aria-label="Add" onClick={() => this.handleOpenNewDialog(true)} className={classes.fab}>
              <AddIcon />
            </Fab>
          </Grid>
          <Dialog className={classes.dialog}
            disableBackdropClick
            disableEscapeKeyDown
            open={dialogCreateNewOpen}
            onClose={() => this.handleOpenNewDialog(false)}>
            <DialogTitle id="form-dialog-title">Create New Workflow</DialogTitle>
            <DialogContent>
              <DialogContentText>Enter the name of the new stage.</DialogContentText>
              <form className={classes.container} noValidate autoComplete="off">
                <TextField
                  id="workflow-name"
                  label="Name"
                  className={classes.textField}
                  value={newStageName}
                  onChange={this.handleCreateName('newStageName')}
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={this.handleAddNew} className={classes.button}>Create</Button>
            </DialogActions>
          </Dialog>
        </main>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowEditor);