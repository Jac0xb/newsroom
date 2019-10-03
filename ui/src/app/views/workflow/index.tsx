import { Fab } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import WorkflowStage from 'app/views/workflow/components/WorkflowStage';
import DialogItem from 'app/components/common/dialog';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';
import { Paper, Typography } from '@material-ui/core';

// Redux
import { connect } from "react-redux";
import { AppState } from 'app/store';
import { WorkflowActionTypes, WorkflowState } from "app/store/workflow/types";
import { dispatchAddStage, dispatchEditStage, dispatchSetStages, dispatchStageAddClick, dispatchCloseDialog, dispatchTextBoxChange, dispatchStageEditClick, dispatchEditFlash } from "app/store/workflow/actions";
import { Dispatch, bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { Stage } from 'app/models';
  
export namespace Workflow {
  export interface Props {
    classes?: any
    match: {
      params: {
        id: number
      }
    }
    workflowState: WorkflowState
    dispatchSetStages: (stages: Array<Stage>) => Promise<void>
    dispatchAddStage: (stage: Stage, index: number) => Promise<void>
    dispatchStageAddClick: (seqID: number) => Promise<void>
    dispatchTextBoxChange: (fieldName: string, newValue: string) => Promise<void>
    dispatchStageEditClick: (stageID: number, seqID: number, newName: string, newDesc: string) => Promise<void>
    dispatchEditStage: () => Promise<void>
    dispatchCloseDialog: () => Promise<void>
    dispatchEditFlash: (flash: string) => Promise<void>
  }
  export interface State {
  }
}

class Workflow extends React.Component<Workflow.Props, Workflow.State, any> {

  constructor(props: Workflow.Props) {
        super(props)
        this.state = { }
  }

  componentDidMount() {
    this.getStages();
    this.getRole();
  }

  // Method to get stages of current workflow from database
  getStages() {
    const id = this.props.match.params.id;

    axios.get("/api/workflows/" + id + "/stages").then((response) => {

      const stages = response.data;
      this.props.dispatchSetStages(stages);
    })
  }

  // Method to get role of the user from database
  getRole() {
    // TODO: check role from db 
    
    // allow user to edit workflows
    // set state
  }

  // Change text dialog text boxes
  handleDialogTextChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.dispatchTextBoxChange(name, event.target.value)
  };

  handleStageAddClick(open: boolean, seqID: number) {
    // Need the ID of the stage so that we know which button is being pressed and where to add the stage.
    this.props.dispatchStageAddClick(seqID)
  };

  // Search and apply current stage info for dialog edit box
  handleStageEditClick = (stageID: number) => {

    const { stages } = this.props.workflowState;

    var dialogTextName = ""
    var dialogTextDesc = ""
    var seqID = 0;

    stages.forEach( (stage, index) => {
      if(stage.id === stageID){
        dialogTextName = stage.name
        dialogTextDesc = stage.description
        seqID = index
      }
    });

    // Update view
    this.props.dispatchStageEditClick(stageID, seqID, dialogTextName, dialogTextDesc)

  };

  handleStageAdd = (textBoxName: string, textBoxDesc: string) => {

    // The ID of the current workflow, the sequence id of the stage.
    const wfId = this.props.match.params.id;
    const seqID = this.props.workflowState.seqID;

    // Post new stage req to backend
    axios.post("/api/workflows/" + wfId + "/stages/" +  seqID, {
      name: textBoxName,
      description: textBoxDesc,
      creator: Number(localStorage.getItem("userID")),
    }).then((response) => {

      // Stages have their own ID, but their position in the workflow is their 'sequenceId'.
      const index = response.data.sequenceId;

      // Add Stage to correct position in array
      this.props.dispatchAddStage(response.data, index)

    }).catch((error) => {

      if (error.response.status == 403){
        this.props.dispatchEditFlash("You lack permissions to add stages in this workflow.")
        this.props.dispatchCloseDialog()
      }
    });
  };

  handleStageEdit = (textBoxName: string, textBoxDesc: string) => {

    const { workflowState } = this.props;

    // The ID of the current workflow, the sequence id of the stage, the id of the stage.
    const wfId = this.props.match.params.id;
    const seqID = workflowState.seqID;
    const stageID = workflowState.stageID

    axios.put("/api/workflows/" + wfId + "/stages/" + stageID, {
      sequenceId: seqID,
      name: textBoxName,
      description: textBoxDesc,
      creator: Number(localStorage.getItem("userID")),
    }).then((response) => {
      // Render new stages edit
      this.getStages()

      // close dialog
      this.props.dispatchEditStage()
    }).catch((error) => {

        if (error.response.status == 403) {
            this.props.dispatchEditFlash("You lack permissions to edit a stage in this workflow.")
            this.props.dispatchCloseDialog()
        }
    });

  };

  handleStageDeleteClick = (stageID: number) => {
    const wfId = this.props.match.params.id;

    axios.delete("/api/workflows/" + wfId + "/stages/" + stageID, {
    }).then((response) => {

      // Render new stages edit
      this.getStages();

    }).catch((error) => {

        if (error.response.status == 403)
            this.props.dispatchEditFlash("You lack permissions to delete a stage in this workflow.")
    });

  };

  render() {

    const { classes, workflowState } = this.props;
    const {} = this.state;

    return (
      <React.Fragment>
        <main className={classes.main}>
        {(workflowState.flash != "") ?
            <Paper className={classes.flashMessage}>
                <Typography variant="caption">
                    {workflowState.flash}
                </Typography>
            </Paper> :
            <div></div>
            }
          <div className={classes.content}>
            <div className={classes.workflowContent}>
              <div className={classes.stage}>
                { workflowState.canEdit ? 
                  <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, 0)} className={classes.addButton}>
                    <AddIcon />
                  </Fab> 
                  : null 
                }
              </div>
              {workflowState.stages.map((stage, index) => (
                <div className={classes.stage}>
                  <WorkflowStage canEdit={workflowState.canEdit} id={stage.id} name={stage.name} desc={stage.description} onEditClick={(stageID: number) => this.handleStageEditClick(stageID)} onDeleteClick={(stageID: number) => this.handleStageDeleteClick(stageID)}/>
                  { workflowState.canEdit ? 
                    <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, index+1)} className={classes.addButton}>
                      <AddIcon />
                    </Fab> 
                    : null 
                  }
                </div>
              ))}
              <DialogItem textBoxName={workflowState.dialogTextName} textBoxDesc={workflowState.dialogTextDesc} title={"Create New Stage"} desc={"Enter new stage information"} show={workflowState.createDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.props.dispatchCloseDialog()} handleSave={this.handleStageAdd}/>
              <DialogItem textBoxName={workflowState.dialogTextName} textBoxDesc={workflowState.dialogTextDesc} title={"Edit Stage"} desc={"Enter stage information"} show={workflowState.editDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.props.dispatchCloseDialog()} handleSave={this.handleStageEdit}/>
            </div>
           </div>
          </main>
      </React.Fragment>
    );
  }
}

// Map to store
const mapStateToProps = (state: AppState, ownProps: Workflow.Props) => ({
  workflowState: state.workflow,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, WorkflowActionTypes>, ownProps: Workflow.Props) => ({
  dispatchSetStages: bindActionCreators(dispatchSetStages, dispatch),
  dispatchAddStage: bindActionCreators(dispatchAddStage, dispatch),
  dispatchStageAddClick: bindActionCreators(dispatchStageAddClick, dispatch),
  dispatchTextBoxChange: bindActionCreators(dispatchTextBoxChange, dispatch),
  dispatchStageEditClick: bindActionCreators(dispatchStageEditClick, dispatch),
  dispatchCloseDialog: bindActionCreators(dispatchCloseDialog, dispatch),
  dispatchEditStage: bindActionCreators(dispatchEditStage, dispatch),
  dispatchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles, { withTheme: true })(Workflow));