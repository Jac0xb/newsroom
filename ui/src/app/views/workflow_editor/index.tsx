import { Fab, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import WorkflowStage from 'app/components/workflow/workflow_stage';
import DialogItem from 'app/components/common/dialog';
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
    createDialogOpen: boolean
    editDialogOpen: boolean
    stageID: number
    currStageIdx: number
  }
}
class WorkflowEditor extends React.Component<WorkflowEditor.Props, WorkflowEditor.State, any> {

  constructor(props: WorkflowEditor.Props) {
    super(props)
    this.state = {
      stages: [],
      createDialogOpen: false,
      editDialogOpen: false,
      stageID: 0,
      currStageIdx: 0
    }
  }

  componentDidMount() {
    const id = this.props.match.params.id;

    axios.get("/api/workflows/" + id + "/stages").then((response) => {

      const stages = response.data;

      this.setState({ stages: stages })
    })
  }

  handleStageAddClick(open: boolean, id: number) {
    // Need the ID of the stage so that we know which button
    //   is being pressed and where to add the stage.
    this.setState({ createDialogOpen: open, stageID: id });
  };

  handleStageEditClick = (id: number) => {

    console.log("editing stage with ID:");
    console.log(id);

    this.setState({ editDialogOpen: true, stageID: id });
  };

  handleAddStage = (textBoxName: string, textBoxDesc: string) => {
    // The ID of the workflow.
    const id = this.props.match.params.id;

    axios.post("/api/workflows/" + id + "/stages/" + this.state.stageID, {
      name: textBoxName,
      creator: "Jacques",
      description: textBoxDesc,
    }).then((response) => {

      // Stages have their own ID, but their position in the workflow is
      //   their 'sequenceId'.
      const index = response.data.sequenceId;

      // Add the stage at the correct position in the list.
      this.state.stages.splice(index, 0, response.data)

      // Reset text boxes, close dialog box.
      this.setState({ createDialogOpen: false });
    });
  };

  handleStageEdit = (textBoxName: string, textBoxDesc: string) => {
    const id = this.props.match.params.id;

    axios.put("/api/workflows/" + id + "/stages/" + this.state.stageID, {
      name: textBoxName,
      creator: "Jacques",
      description: textBoxDesc,
    }).then((response) => {

      console.log(response);

      // TODO
      this.componentDidMount();
      // WILL RERENDER LIST

      // reset text boxes, close dialog
      this.setState({ editDialogOpen: false });
    });

  };

  render() {

    const { classes } = this.props;
    const { stages, createDialogOpen, editDialogOpen } = this.state;

    return (
      <React.Fragment>
        <PrimarySearchAppBar />
        <main className={classes.layout}>
          <Grid className={classes.grid} container spacing={16}>
            <Fab size="small" color="secondary" aria-label="Add" onClick={() => this.handleStageAddClick(true, 0)} className={classes.fab}>
              <AddIcon />
            </Fab>
            {stages.map((stage, index) => (
              <div className={classes.stagePlusButton}>
                <Grid key={index} className={classes.stageGrid} item>
                  <WorkflowStage id={stage.id} name={stage.name} desc={stage.description} onClick={(id: number) => this.handleStageEditClick(id)} />
                </Grid>
                <Fab size="small" color="secondary" aria-label="Add" onClick={() => this.handleStageAddClick(true, index + 1)} className={classes.fab}>
                  <AddIcon />
                </Fab>
              </div>
            ))}
          </Grid>

          <DialogItem title={"Create New Stage"} desc={"Enter new stage information"} show={createDialogOpen} handleSave={this.handleAddStage} />
          <DialogItem title={"Edit Stage"} desc={"Enter stage information"} show={editDialogOpen} handleSave={this.handleStageEdit} />
        </main>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowEditor);