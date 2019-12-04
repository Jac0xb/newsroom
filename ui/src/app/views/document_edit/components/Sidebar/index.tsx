import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Button, Drawer } from '@material-ui/core';
import { NRWorkflow, NRTrigger, NRStage } from 'app/utils/models';
import { Link as RouterLink } from 'react-router-dom';
import { Typography as AntTypography, Divider, Steps } from 'antd';
import MenuIcon from '@material-ui/icons/Menu';

const { Step } = Steps;

export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any;
        workflow?: NRWorkflow;
        trigger?: NRTrigger;
        currentStage: number;
        onMove: (direction: string) => void;
        onToggle: () => void;
        closed: boolean;
    }
    export interface State {
    }
}
class WorkflowMenuBar extends React.Component<WorkflowMenuBar.Props, WorkflowMenuBar.State, any> {

    constructor(props: WorkflowMenuBar.Props) {
        super(props);
        this.state = { };
        
    }

    render() {

        const { classes, workflow, currentStage, trigger } = this.props;
        const {  } = this.state;

        if (!workflow) {
            return <div></div>
        }

        if (this.props.closed) {
            return (
                <main className={classes.layout}>
                    <Drawer
                        anchor="right"
                        variant="permanent"
                        classes={{
                        paper: classes.closedDrawer,
                        }}
                    >
                        <Button style={{padding: "16px"}} onClick={(e) => this.props.onToggle()}>
                            <MenuIcon />
                        </Button>
                    </Drawer>
                </main>
            );
        }
        
        const stages = workflow.stages.sort((a, b) => a.sequenceId - b.sequenceId);

        const workflowRouterLink = (props: any) => <RouterLink to={"/workflow/" + workflow.id + "/edit"} {...props} />
        
        const stageComponents = stages.map((stage: NRStage) => {
            return <Step key={stage.id} title={stage.name} description={(currentStage == stage.sequenceId) ? stage.description : ""}/>
        });

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
                    <Button style={{padding: "16px"}} onClick={(e) => this.props.onToggle()}>
                        <MenuIcon />
                    </Button>
                    <Divider orientation="center" style={{margin: 0, marginBottom: 16}}>
                        <AntTypography.Text>Lifecycle</AntTypography.Text>
                    </Divider>
                    <Steps direction="vertical" current={currentStage}>
                        {stageComponents}
                    </Steps>
                    <div className={classes.stageButtonGroup} style={{display: "flex", width:"100%", }}>
                        <Button className={classes.stageButton} variant="contained" size="small"
                            disabled={currentStage == 0 || !workflow || (workflow && workflow.stages && workflow.stages[currentStage] && workflow.stages[currentStage].permission == 0)}
                            onClick={() => this.props.onMove("prev")}
                        >
                                Back
                        </Button>
                        <Button className={classes.stageButton} variant="contained" size="small"
                            disabled={currentStage == stages.length - 1 || !workflow || (workflow && workflow.stages && workflow.stages[currentStage] && workflow.stages[currentStage].permission == 0)} 
                            onClick={() => this.props.onMove("next")}
                        >
                            Next
                        </Button>
                    </div>
                </Drawer>
            </main>);

        /*
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
                            {stages.map((stage: NRStage) => {
                                return (
                                <Step key={stage.id}>
                                    <StepLabel>
                                    {stage.name}
                                    <Typography variant="caption">{stage.description}</Typography>
                                    </StepLabel>
                                </Step>)
                            })}
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
        */
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);