import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Button, ExpansionPanel, ExpansionPanelActions, ExpansionPanelDetails, ExpansionPanelSummary, Drawer, Link, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { NRStage, NRWorkflow, NRTrigger } from 'app/utils/models';
import { ExpandMore } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any
        workflow?: NRWorkflow
        trigger?: NRTrigger
        currentStage: number
        onMove: (direction: string) => void
    }
    export interface State {

    }
}
class WorkflowMenuBar extends React.Component<WorkflowMenuBar.Props, WorkflowMenuBar.State, any> {

    constructor(props: WorkflowMenuBar.Props) {
        super(props);
        this.state = {};
        
    }

    render() {

        const { classes, workflow, currentStage, trigger } = this.props;
        const {  } = this.state;

        if (!workflow || (workflow && workflow.permission == 0)) {
            return <div></div>
        }

        const stages = workflow.stages.sort((a, b) => a.sequenceId - b.sequenceId);

        const workflowRouterLink = (props: any) => <RouterLink to={"/workflow/" + workflow.id + "/edit"} {...props} />

        return (
        <main className={classes.layout}>
             <Drawer
                anchor="right"
                className={classes.drawer}
                variant="permanent"
                classes={{
                paper: classes.drawerPaper,
                }}
            >
                <ExpansionPanel expanded={true} >
                        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                            <div>
                                <Typography variant="subtitle1">
                                    <div>Workflow:</div>
                                </Typography>      
                                <Typography variant="subtitle1">
                                    <Link component={workflowRouterLink}>
                                        <div style={{ fontWeight: "bold" }}>{workflow.name}</div>
                                    </Link>
                                </Typography>
                            </div>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.details}>
                            <Stepper orientation="vertical" className={classes.stepper} activeStep={currentStage}>
                            {/* {stages.map((stage: NRStage) => {
                                return (
                                <Step key={stage.id}>
                                    <StepLabel>
                                    {stage.name}
                                    <Typography variant="caption">{stage.description}</Typography>
                                    </StepLabel>
                                </Step>)
                            })} */}
                            </Stepper>
                        </ExpansionPanelDetails>
                        <ExpansionPanelActions className={classes.actions}>
                            <Button variant="contained" size="small"
                            disabled={currentStage == 0 || !workflow || (workflow && workflow.stages && workflow.stages[currentStage] && workflow.stages[currentStage].permission == 0)}
                            onClick={() => this.props.onMove("prev")}>Back</Button>
                            <Button variant="contained" size="small"
                            disabled={currentStage == stages.length - 1 || !workflow || (workflow && workflow.stages && workflow.stages[currentStage] && workflow.stages[currentStage].permission == 0)} 
                            onClick={() => this.props.onMove("next")}>Next</Button>
                        </ExpansionPanelActions>
                    </ExpansionPanel>
            </Drawer>
        </main>
        );
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);