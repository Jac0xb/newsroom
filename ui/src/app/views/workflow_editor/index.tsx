import { Fab } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import WorkflowStage from 'app/views/workflow_editor/components/WorkflowStage';
// import WorkflowMenuBar from 'app/views/workflow_editor/components/WorkflowSidebar'
import DialogItem from 'app/components/common/dialog';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';
import { Paper, Typography } from '@material-ui/core';

// TODO
import { connect } from "react-redux";
import { AppState } from 'store';
import { WorkflowActionTypes, WorkflowState } from "../../../store/workflow/types";
import { dispatchAddStage, dispatchSetStages, dispatchStageAddClick } from "../../../store/workflow//actions";
import { Dispatch, bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { Stage } from 'app/models';
  
export namespace WorkflowEditor {
  export interface Props {
    classes?: any
    match: {
      params: {
        id: number
      }
    }
    workflowState: WorkflowState
    dispatchSetStages: (stages: Array<Stage>) => void
    dispatchAddStage: (stage: Stage, index: number) => void
    dispatchStageAddClick: (seqID: number) => void
  }
  export interface State {
    stages: Array<Stage>
    createDialogOpen: boolean
    editDialogOpen: boolean
    stageID: number
    seqID: number
    dialogTextName: string
    dialogTextDesc: string
    canEdit: boolean
    flash: string
  }
}

class WorkflowEditor extends React.Component<WorkflowEditor.Props, WorkflowEditor.State, any> {

  constructor(props: WorkflowEditor.Props) {
        super(props)
        this.state = {
            flash: "",
            stages: [],
            createDialogOpen: false,
            editDialogOpen: false,
            stageID: 0,
            seqID: 0,
            dialogTextName: '',
            dialogTextDesc: '',
            canEdit: false
        }
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
      this.props.dispatchSetStages(stages)
    })
  }

  // Method to get role of the user from database
  getRole() {
    // TODO: check role from db 
    
    // allow user to edit workflows
    // set state
  }

  handleDialogTextChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {

    if(name == "textBoxName"){
        this.setState({ dialogTextName: event.target.value });
    }
    if(name == "textBoxDesc"){
        this.setState({ dialogTextDesc: event.target.value });
    }
  };

  handleStageAddClick(open: boolean, seqID: number) {
    // Need the ID of the stage so that we know which button is being pressed and where to add the stage.
    this.props.dispatchStageAddClick(seqID)
  };

  // Search and apply current stage info for dialog edit box
  handleStageEditClick = (stageID: number) => {

    const { stages } = this.state;

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
    this.setState({ dialogTextName, dialogTextDesc, editDialogOpen: true, stageID, seqID });

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

        if (error.response.status == 403)
            this.setState({ flash: "You lack permissions to add stages in this workflow." });
        
        this.setState({ createDialogOpen: false });
    });
  };

  handleStageEdit = (textBoxName: string, textBoxDesc: string) => {

    // The ID of the current workflow, the sequence id of the stage, the id of the stage.
    const wfId = this.props.match.params.id;
    const seqID = this.state.seqID;
    const stageID = this.state.stageID

    axios.put("/api/workflows/" + wfId + "/stages/" + stageID, {
      sequenceId: seqID,
      name: textBoxName,
      description: textBoxDesc,
      creator: Number(localStorage.getItem("userID")),
    }).then((response) => {
      // Render new stages edit
      this.getStages()

      // close dialog
      this.setState({ editDialogOpen: false });
    }).catch((error) => {

        if (error.response.status == 403) {
            this.setState({ flash: "You lack permissions to edit a stage in this workflow" });
            this.setState({ createDialogOpen: false });
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
            this.setState({ flash: "You lack permissions to delete a stage in this workflow." });
    });

  };

  render() {

    const { classes, workflowState } = this.props;
    const { stages, createDialogOpen, editDialogOpen, dialogTextName, dialogTextDesc, canEdit, flash } = this.state;

    return (
      <React.Fragment>
        <main className={classes.main}>
        {(this.state.flash != "") ?
            <Paper className={classes.flashMessage}>
                <Typography variant="caption">
                    {this.state.flash}
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
              <DialogItem textBoxName={dialogTextName} textBoxDesc={dialogTextDesc} title={"Create New Stage"} desc={"Enter new stage information"} show={workflowState.createDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.setState({createDialogOpen: false})} handleSave={this.handleStageAdd}/>
              <DialogItem textBoxName={dialogTextName} textBoxDesc={dialogTextDesc} title={"Edit Stage"} desc={"Enter stage information"} show={editDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.setState({editDialogOpen: false})} handleSave={this.handleStageEdit}/>
            </div>
           </div>
          </main>
      </React.Fragment>
    );
  }
}

// Map to store
const mapStateToProps = (state: AppState, ownProps: WorkflowEditor.Props) => ({
  workflowState: state.workflow,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, WorkflowActionTypes>, ownProps: WorkflowEditor.Props) => ({
  dispatchSetStages: bindActionCreators(dispatchSetStages, dispatch),
  dispatchAddStage: bindActionCreators(dispatchAddStage, dispatch),
  dispatchStageAddClick: bindActionCreators(dispatchStageAddClick, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles, { withTheme: true })(WorkflowEditor));