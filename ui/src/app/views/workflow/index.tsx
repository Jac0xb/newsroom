import { withStyles } from '@material-ui/core/styles';
import WorkflowStage from 'app/views/workflow/components/WorkflowStage';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';
import { Paper, Typography } from '@material-ui/core';
import { mapStateToProps } from 'app/store/workflow/reducers';
import { mapDispatchToProps } from "app/store/workflow/actions";
import { connect } from "react-redux";
import { WorkflowDispatchers, WorkflowState } from "app/store/workflow/types";
import WorkflowSidebar from './components/WorkflowSidebar';
import Subheader from 'app/components/common/subheader';
import { values } from 'lodash-es';
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
        this.state = {}
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

    handleStageAddClick(open: boolean, seqID: number) {
        // Need the ID of the stage so that we know which button is being pressed and where to add the stage.
        this.props.fetchStageAddClick(seqID)
    };

    // Search and apply current stage info for dialog edit box
    // handleStageEditClick = (stageID: number) => {

    //     const { stages } = this.props;

    //     var dialogTextName = ""
    //     var dialogTextDesc = ""
    //     var seqID = 0;

    //     stages.forEach((stage, index) => {
    //         if (stage.id === stageID) {
    //             dialogTextName = stage.name
    //             dialogTextDesc = stage.description
    //             seqID = index
    //         }
    //     });

    //     // Show Dialog with current stage info
    //     // this.props.fetchStageEditClick(stageID, seqID, dialogTextName, dialogTextDesc)

    // };

    handleStageAdd = (textBoxName: string, textBoxDesc: string) => {

        // The ID of the current workflow, the sequence id of the stage.
        const wfId = this.props.match.params.id;
        const seqID = this.props.currentStage.sequenceId;

        // Post new stage req to backend
        axios.post("/api/workflows/" + wfId + "/stages/" + seqID, {
            name: textBoxName,
            description: textBoxDesc,
            creator: Number(localStorage.getItem("userID")),
        }).then((response) => {

            // Stages have their own ID, but their position in the workflow is their 'sequenceId'.
            const index = response.data.sequenceId;

            // Add Stage to correct position in array
            this.props.fetchAddStage(response.data, index)

        }).catch((error) => {

            if (error.response.status == 403) {
                this.props.fetchEditFlash("You lack permissions to add stages in this workflow.")
            }
        });
    };

    handleStageEdit = (textBoxName: string, textBoxDesc: string) => {

        const { currentStage } = this.props;
        // The ID of the current workflow, the sequence id of the stage, the id of the stage.
        const wfId = this.props.match.params.id;

        axios.put("/api/workflows/" + wfId + "/stages/" + currentStage.id, {
            sequenceId: currentStage.sequenceId,
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

    render() {

        const { classes, currentStage } = this.props;
        const { } = this.state;
        
        const tabs = this.props.stages.sort((a, b) => a.id - b.id ).map((stage) => {
            return stage.name;
        });

        return (
            <React.Fragment>
                <main className={classes.main}>
                    <Subheader tabs={tabs} selectedTab={currentStage.sequenceId} onTabChange={((sequenceID: number) => this.props.fetchStageChange(sequenceID)).bind(this)}/>
                    <div className={classes.spacer} />
                    <WorkflowSidebar stage={currentStage} 
                    onTextChange={this.props.fetchEditStage} 
                    onUpdateClick={(updatedStage: NRStage) => this.props.fetchUpdateStage(this.props.match.params.id, updatedStage)} />

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
                            {this.props.stages.map((stage, index) => (
                                <div className={classes.stage}>
                                    <WorkflowStage show={currentStage.sequenceId}
                                        key={index}
                                        index={stage.sequenceId} 
                                        canEdit={this.props.canEdit} 
                                        id={stage.id} 
                                        name={stage.name} 
                                        desc={stage.description} 
                                        onDeleteClick={(stageID: number) => this.handleStageDeleteClick(stageID)} 
                                    />
                                </div>
                            ))}
                            {/* 
                            <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, 0)} className={classes.addButton}>
                            <Fab size="small" color="primary" aria-label="Add" onClick={() => this.handleStageAddClick(true, index+1)} className={classes.addButton}>
                            <AddIcon />
                            <DialogItem textBoxName={this.props.dialogTextName} textBoxDesc={this.props.dialogTextDesc} title={"Create New Stage"} desc={"Enter new stage information"} show={this.props.createDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.props.fetchCloseDialog()} handleSave={this.handleStageAdd} />
                            <DialogItem textBoxName={this.props.dialogTextName} textBoxDesc={this.props.dialogTextDesc} title={"Edit Stage"} desc={"Enter stage information"} show={this.props.editDialogOpen} handleTextBoxesChange={this.handleDialogTextChange} handleClose={() => this.props.fetchCloseDialog()} handleSave={this.handleStageEdit} />
                            */}
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