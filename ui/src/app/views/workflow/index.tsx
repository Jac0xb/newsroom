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
        this.props.fetchSetStages(id);
        this.props.fetchStageChange(0)
        this.props.fetchWorkflow(id);
    }

    // Method to get role of the user from database
    getRole() {
        this.props.fetchSetPermissions(true)
    }

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

        }).catch((error) => {

            if (error.response.status == 403) {
                this.props.fetchEditFlash("You lack permissions to edit a stage in this workflow.")
            }
        });

    };

    render() {

        const { classes, currentStage } = this.props;
        const { } = this.state;
        
        const tabs = this.props.stages.sort((a, b) => a.sequenceId - b.sequenceId ).map((stage) => {
            return stage.name;
        });
        

        return (
            <React.Fragment>
                <main className={classes.main}>
                    <Subheader tabs={tabs} selectedTab={currentStage ? currentStage.sequenceId : 0} onTabChange={((sequenceID: number) => {

                        if (sequenceID == -1) {
                            return;
                        }

                        this.props.fetchStageChange(sequenceID);
                    
                    }).bind(this)
                    }/>
                    <div className={classes.spacer} />
                    <WorkflowSidebar 
                        workflow={this.props.workflow}
                        stage={currentStage ? currentStage : new NRStage} 
                        onTextChange={this.props.fetchEditStage}
                        onUpdateClick={(updatedStage: NRStage) => this.props.fetchUpdateStage(this.props.match.params.id, updatedStage)}
                        onDeleteClick={() => this.props.fetchDeleteStage(this.props.match.params.id, currentStage.id)}  
                        onAddStage={(sequence: number) => this.props.fetchAddStage(this.props.match.params.id, new NRStage({name: "New Stage", description: ""}), sequence)}
                        onAddTriggerClick={this.props.fetchAddTrigger}
                        trigger={this.props.trigger}
                    />

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
                            <div className={classes.buttonGroup}>
                                <Button 
                                    variant="contained" 
                                    className={classes.button} 
                                    onClick={() => this.props.fetchAddStage(this.props.match.params.id, new NRStage({name: "New Stage", description: ""}), this.props.stages.length)}
                                    disabled={(this.props.workflow && this.props.workflow.permission == 1) ? false : true}
                                    >
                                    Add Stage
                                </Button>
                            </div>
                            {this.props.stages.map((stage, index) => (
                                <div className={classes.stage}>
                                    <WorkflowStage show={currentStage.sequenceId}
                                        key={index}
                                        index={stage.sequenceId} 
                                        canEdit={this.props.canEdit} 
                                        id={stage.id} 
                                        name={stage.name} 
                                        desc={stage.description} 
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