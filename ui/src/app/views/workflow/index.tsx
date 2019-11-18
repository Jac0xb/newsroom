import { withStyles } from '@material-ui/core/styles';
import WorkflowStage from 'app/views/workflow/components/WorkflowStage';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';
import { Paper, Typography, Button } from '@material-ui/core';
import { mapStateToProps } from 'app/store/workflow/reducers';
import { mapDispatchToProps } from "app/store/workflow/actions";
import { connect } from "react-redux";
import { WorkflowDispatchers, WorkflowState } from "app/store/workflow/types";
import WorkflowSidebar from './components/WorkflowSidebar';
import Subheader from 'app/components/common/subheader';
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
    export interface State { 
    }
}

class Workflow extends React.Component<Workflow.Props, Workflow.State, any> {

    constructor(props: Workflow.Props) {
        super(props);
        this.state = { }; 

        this.props.clearFlash();
    }

    componentDidMount() {
        this.getStages();
        this.getRole();
    }

    // Method to get stages of current workflow from database
    async getStages() {
        const id = this.props.match.params.id;
        await this.props.fetchSetStages(id);
        await this.props.fetchStageChange(0);
        await this.props.fetchWorkflow(id);
    }

    // Method to get role of the user from database
    getRole() {
        this.props.fetchSetPermissions(true)
    }

    handleStageEdit = (textBoxName: string, textBoxDesc: string) => {

        const { currentStage } = this.props;
        // The ID of the current workflow, the sequence id of the stage, the id of the stage.
        const wfId = this.props.match.params.id;

        this.props.clearFlash();

        if (currentStage == undefined) {
            this.props.fetchEditFlash("No stage exists!");
            return;
        }

        axios.put("/api/workflows/" + wfId + "/stages/" + currentStage.id, {
            sequenceId: currentStage.sequenceId,
            name: textBoxName,
            description: textBoxDesc,
            creator: Number(localStorage.getItem("user-id")),
        }).then((response) => {
            // Render new stages edit
            this.getStages()

        }).catch((error) => {

            if (error.response.status == 403) {
                this.props.fetchEditFlash("You lack permissions to edit a stage in this workflow.")
            }
        });

    };

    switchToStage(sequenceId: number) {

        if (sequenceId == -1) { return; }

        this.props.clearFlash();
        this.props.fetchStageChange(sequenceId);
        
    }

    addStage(sequence: number) {
        this.props.clearFlash();
        this.props.fetchAddStage(this.props.match.params.id, new NRStage({name: "New Stage", description: ""}), sequence)
    }

    updateStage(updatedStage: NRStage) {
        this.props.clearFlash();
        this.props.fetchUpdateStage(this.props.match.params.id, updatedStage)
    }

    addTrigger(stage: NRStage, channel: string) {
        this.props.clearFlash();
        this.props.fetchAddTrigger(stage, channel);
    }

    deleteTrigger(stage: NRStage) {
        this.props.clearFlash();
        this.props.fetchDeleteTrigger(stage);
    }

    deleteStage(workflowId: number, stageId: number) {
        this.props.clearFlash();
        this.props.fetchDeleteStage(workflowId, stageId);
    } 

    render() {

        const { classes, currentStage } = this.props;
        const { } = this.state;
        
        const tabs = this.props.stages.sort((a, b) => a.sequenceId - b.sequenceId ).map((stage) => {
            return stage.name;
        });
        

        return (
            <React.Fragment>
                <main className={classes.main}>
                    <Subheader 
                        tabs={tabs} 
                        selectedTab={currentStage ? currentStage.sequenceId : 0} 
                        onTabChange={(sequenceId: number) => this.switchToStage(sequenceId)}
                    />
                    <div className={classes.spacer} />
                    <WorkflowSidebar 
                        closed={this.props.sidebarClosed}
                        onToggle={() => this.props.toggleSidebar()}
                        workflow={this.props.workflow}
                        stage={currentStage} 
                        onTextChange={this.props.fetchEditStage}
                        onUpdateClick={(stage) => this.updateStage(stage)}
                        onDeleteClick={() => {

                            if (currentStage == undefined) {
                                return;
                            }

                            this.deleteStage(this.props.match.params.id, currentStage.id)}  
                        }
                        onAddStage={(sequenceId) => this.addStage(sequenceId)}
                        onAddTriggerClick={(stage, channel) => this.addTrigger(stage, channel)}
                        onDeleteTriggerClick={(stage) => this.deleteTrigger(stage)}
                    />

                    <div style={(this.props.sidebarClosed) ? {marginRight: 64} : {marginRight: 250}}>
                        {(this.props.flash != "") ?
                            <Paper className={classes.flashMessage}>
                                <Typography variant="caption">
                                    {this.props.flash}
                                </Typography>
                            </Paper> :
                            <div></div>
                        }
                        <div className={classes.workflowContent}>
                            {this.props.stages.map((stage, index) => (
                                <div className={classes.stage}>
                                    <WorkflowStage 
                                        show={(currentStage) ? currentStage.sequenceId : 0}
                                        key={index}
                                        index={stage.sequenceId} 
                                        canEdit={this.props.canEdit} 
                                        id={stage.id} 
                                        name={stage.name} 
                                        desc={stage.description} 
                                        documents={stage.documents}
                                    />
                                </div>
                            ))}
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