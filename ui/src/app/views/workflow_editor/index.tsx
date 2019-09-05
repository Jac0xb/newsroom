import { Fab } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import WorkflowStage from 'app/views/workflow_editor/components/workflow_stage';
import WorkflowMenuBar from 'app/views/workflow_editor/components/workflow_menubar'
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
    dialogTextName: string
    dialogTextDesc: string
    canEdit: boolean
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
      dialogTextName: '',
      dialogTextDesc: '',
      currStageIdx: 0,
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

      this.setState({ stages })
    })
  }

  // Method to get role of the user from database
  getRole() {
    // TODO: check role from db 
    
    // allow user to edit workflows
    this.setState({ canEdit: true })
  }

  handleDialogTextChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {

    if(name == "textBoxName"){
        this.setState({ dialogTextName: event.target.value });
    }
    if(name == "textBoxDesc"){
        this.setState({ dialogTextDesc: event.target.value });
    }
  };

  handleStageAddClick(open: boolean, id: number) {
    // Need the ID of the stage so that we know which button
    //   is being pressed and where to add the stage.
    this.setState({ dialogTextName: '', dialogTextDesc: '', createDialogOpen: open, stageID: id });
  };

  // Search and apply current stage info for dialog edit box
  handleStageEditClick = (id: number) => {

    const { stages } = this.state;

    var dialogTextName = ""
    var dialogTextDesc = ""

    stages.forEach( stage => {
      if(stage.id === id){
        dialogTextName = stage.name
        dialogTextDesc = stage.description
      }
    });

    this.setState({ dialogTextName, dialogTextDesc, editDialogOpen: true, stageID: id });

  };

  handleAddStage = (textBoxName: string, textBoxDesc: string) => {

    // The ID of the current workflow.
    const id = this.props.match.params.id;

    axios.post("/api/workflows/" + id + "/stages/" + this.state.stageID, {
      name: textBoxName,
      creator: "Jacques",
      description: textBoxDesc,
    }).then((response) => {

      // Stages have their own ID, but their position in the workflow is their 'sequenceId'.
      const index = response.data.sequenceId;

      // Add the stage at the correct position in the list.
      this.state.stages.splice(index, 0, response.data)

      // close dialog box, rerender stages
      this.setState({ createDialogOpen: false, stages: this.state.stages });
    });
  };

  handleStageEdit = (textBoxName: string, textBoxDesc: string) => {
    const id = this.props.match.params.id;

    axios.put("/api/workflows/" + id + "/stages/" + this.state.stageID, {
      name: textBoxName,
      creator: "Jacques",
      description: textBoxDesc,
    }).then((response) => {

      // Render new stages edit
      this.getStages()

      // close dialog
      this.setState({ editDialogOpen: false });
    });

  };

  handleStageDeleteClick = (stageID: number) => {
    const id = this.props.match.params.id;

    axios.delete("/api/workflows/" + id + "/stages/" + stageID, {
    }).then((response) => {

      // Render new stages edit
      this.getStages();

    });

  };

  render() {

    const { classes } = this.props;
    const { stages, createDialogOpen, editDialogOpen, dialogTextName, dialogTextDesc, canEdit } = this.state;

    return (
      <React.Fragment>
        <main>
          <div className={classes.menuGroup}>
            <WorkflowMenuBar />
          </div>

          {/* Spacer height */}
          <div className={classes.menuSpacerHeight}></div>

          <div className={classes.content}>
            {/* Spacer width */}
            <div className={classes.menuSpacerWidth}></div>
            <div className={classes.workflowContent}>
              <div className={classes.stage}>
                { canEdit ? 
                  <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, 0)} className={classes.addButton}>
                    <AddIcon />
                  </Fab> 
                  : null 
                }
              </div>
              {stages.map((stage, index) => (
                <div className={classes.stage}>
                  <WorkflowStage canEdit={canEdit} id={stage.id} name={stage.name} desc={stage.description} onEditClick={(id: number) => this.handleStageEditClick(id)} onDeleteClick={(id: number) => this.handleStageDeleteClick(id)}/>
                  { canEdit ? 
                    <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, 0)} className={classes.addButton}>
                      <AddIcon />
                    </Fab> 
                    : null 
                  }
                </div>
              ))}
              <DialogItem textBoxName={dialogTextName} textBoxDesc={dialogTextDesc} title={"Create New Stage"} desc={"Enter new stage information"} show={createDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.setState({createDialogOpen: false})}  handleSave={this.handleAddStage}/>
              <DialogItem textBoxName={dialogTextName} textBoxDesc={dialogTextDesc} title={"Edit Stage"} desc={"Enter stage information"} show={editDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.setState({editDialogOpen: false})} handleSave={this.handleStageEdit}/>
            </div>
           </div>
          </main>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowEditor);