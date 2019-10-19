import { Fab, Tabs, Tab, AppBar, Box } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import WorkflowStage from 'app/views/workflow/components/WorkflowStage';
import DialogItem from 'app/components/common/dialog';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';
import { Paper, Typography } from '@material-ui/core';
import { mapStateToProps  } from 'app/store/workflow/reducers';
import { mapDispatchToProps } from "app/store/workflow/actions";
import { connect } from "react-redux";
import { WorkflowDispatchers, WorkflowState } from "app/store/workflow/types";
import WorkflowSidebar from './components/WorkflowSidebar';
import { NRDocument } from '../../../../../newsroom-api/src/interfaces';
import { NRStage } from 'app/utils/models';

export namespace Workflow {
  export interface Props extends WorkflowDispatchers, WorkflowState {
    classes?: any
    match: {
      params: {
        id: number
      }
    }
  }
  export interface State { }
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
      this.props.fetchSetStages(stages);
      this.props.fetchStageChange(0)
    })
  }

  // Method to get role of the user from database
  getRole() {
    // TODO: Set User edit permissions
    const wfId = this.props.match.params.id;

    /*
    //get users roles
    axios.get("/api/users/" + user + "/roles").then((response) => {
      var role = response.data[0].id
      // get permissions for this role
      axios.get("/api/roles/" + role ).then((res) => {
        var wfpermissions = res.data.wfpermissions
        wfpermissions.forEach((wf: any) => {
          if(wf.id == wfId && wf.access == 1){
            // set perm
            this.props.fetchSetPermissions(true)
          }
        });
      })
    })
    */
    this.props.fetchSetPermissions(true)
  }

  // Change text dialog text boxes
  handleDialogTextChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.fetchTextBoxChange(name, event.target.value)
  };

  handleStageAddClick(open: boolean, seqID: number) {
    // Need the ID of the stage so that we know which button is being pressed and where to add the stage.
    this.props.fetchStageAddClick(seqID)
  };

  // Search and apply current stage info for dialog edit box
  handleStageEditClick = (stageID: number) => {

    const { stages } = this.props;

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

    // Show Dialog with current stage info
    this.props.fetchStageEditClick(stageID, seqID, dialogTextName, dialogTextDesc)

  };

  handleStageAdd = (textBoxName: string, textBoxDesc: string) => {

    // The ID of the current workflow, the sequence id of the stage.
    const wfId = this.props.match.params.id;
    const seqID = this.props.seqID;

    // Post new stage req to backend
    axios.post("/api/workflows/" + wfId + "/stages/" +  seqID, {
      name: textBoxName,
      description: textBoxDesc,
      creator: Number(localStorage.getItem("userID")),
    }).then((response) => {

      // Stages have their own ID, but their position in the workflow is their 'sequenceId'.
      const index = response.data.sequenceId;

      // Add Stage to correct position in array
      this.props.fetchAddStage(response.data, index)

    }).catch((error) => {

      if (error.response.status == 403){
        this.props.fetchEditFlash("You lack permissions to add stages in this workflow.")
        this.props.fetchCloseDialog()
      }
    });
  };

  handleStageEdit = (textBoxName: string, textBoxDesc: string) => {

    const { seqID, stageID } = this.props;
    // The ID of the current workflow, the sequence id of the stage, the id of the stage.
    const wfId = this.props.match.params.id;

    axios.put("/api/workflows/" + wfId + "/stages/" + stageID, {
      sequenceId: seqID,
      name: textBoxName,
      description: textBoxDesc,
      creator: Number(localStorage.getItem("user-id")),
    }).then((response) => {
      // Render new stages edit
      this.getStages()

      // close dialog
      // this.props.fetchEditStage()
    }).catch((error) => {

        if (error.response.status == 403) {
            this.props.fetchEditFlash("You lack permissions to edit a stage in this workflow.")
            this.props.fetchCloseDialog()
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
            this.props.fetchEditFlash("You lack permissions to delete a stage in this workflow.")
    });

  };

  // For scrollable stage tabs
  a11yProps(index: any) {
    return {
      id: `scrollable-auto-tab-${index}`,
      'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
  }

  handleTextChange = (name: string, newValue: string) => {
    var updateCurrent = this.props.currentStage

    if(name == "name")
      updateCurrent.name = newValue;
    if(name == "description")
      updateCurrent.description = newValue;
    

    this.props.fetchEditStage(updateCurrent)
  };

  render() {

    const { classes, currentStage } = this.props;
    const { } = this.state;

    return (
      <React.Fragment>
        <main className={classes.main}>
        <AppBar position="static" color="default">
        <Tabs
          value={currentStage.sequenceId}
          onChange={(event: React.ChangeEvent<{}>, sequenceID: number) => this.props.fetchStageChange(sequenceID)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="Stage One" {...this.a11yProps(0)} />
          <Tab label="Stage Two" {...this.a11yProps(1)} />
          <Tab label="Stage Three" {...this.a11yProps(2)} />
        </Tabs>
      </AppBar>
      <WorkflowSidebar textName={currentStage.name} textDesc={currentStage.description} onTextChange={this.handleTextChange} />

        {(this.props.flash != "") ?
            <Paper className={classes.flashMessage}>
                <Typography variant="caption">
                    {this.props.flash}
                </Typography>
            </Paper> :
            <div></div>
        }
          <div className={classes.content}>
            <div className={classes.workflowContent}>
              <div className={classes.stage}>
                {/* { !this.props.canEdit ? 
                  <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, 0)} className={classes.addButton}>
                    <AddIcon />
                  </Fab> 
                  : null 
                } */}
              </div>
              {this.props.stages.map((stage, index) => (
                <div className={classes.stage}>
                  <WorkflowStage show={currentStage.sequenceId} index={stage.sequenceId} canEdit={this.props.canEdit} id={stage.id} name={stage.name} desc={stage.description} onEditClick={(stageID: number) => this.handleStageEditClick(stageID)} onDeleteClick={(stageID: number) => this.handleStageDeleteClick(stageID)} onStageEditClick={this.props.fetchStageChange}/>
                  {/* { this.props.canEdit ? 
                    <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, index+1)} className={classes.addButton}>
                      <AddIcon />
                    </Fab> 
                    : null 
                  } */}
                </div>
              ))}
              <DialogItem textBoxName={this.props.dialogTextName} textBoxDesc={this.props.dialogTextDesc} title={"Create New Stage"} desc={"Enter new stage information"} show={this.props.createDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.props.fetchCloseDialog()} handleSave={this.handleStageAdd}/>
              <DialogItem textBoxName={this.props.dialogTextName} textBoxDesc={this.props.dialogTextDesc} title={"Edit Stage"} desc={"Enter stage information"} show={this.props.editDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.props.fetchCloseDialog()} handleSave={this.handleStageEdit}/>
            </div>
           </div>
          </main>
      </React.Fragment>
    );
  }
}

export default connect<Workflow.Props>(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles, { withTheme: true })(Workflow));