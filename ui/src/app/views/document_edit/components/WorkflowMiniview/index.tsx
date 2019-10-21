import { Button, ExpansionPanel, ExpansionPanelActions, ExpansionPanelDetails, ExpansionPanelSummary, Link, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';
import { NRWorkflow, NRStage } from 'app/utils/models';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styles } from './styles';

export namespace WorkflowMiniView {
  export interface Props {
    classes?: any
    workflow: NRWorkflow
    currentStage: number
    onMove: (direction: string) => void
  }
  export interface State {
  }
}
class WorkflowMiniView extends React.Component<WorkflowMiniView.Props, WorkflowMiniView.State> {

  constructor(props: WorkflowMiniView.Props) {
    super(props)
    this.state = {}
  }

  render() {

    const { classes, workflow, currentStage } = this.props;

    const stages = workflow.stages.sort((a, b) => a.sequenceId - b.sequenceId);
    
    const workflowRouterLink = (props: any) => <RouterLink to={"/workflow/" + workflow.id + "/edit"} {...props} />

    return (
      <main className={classes.layout}>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">
              <Link component={workflowRouterLink}>
                Workflow: <span style={{ fontWeight: "bold" }}>{workflow.name}</span>
              </Link>
            </Typography>
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
              disabled={currentStage == 0}
              onClick={() => this.props.onMove("prev")}>Back</Button>
            <Button variant="contained" size="small"
              disabled={currentStage == stages.length - 1}
              onClick={() => this.props.onMove("next")}>Next</Button>
          </ExpansionPanelActions>
        </ExpansionPanel>
      </main>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowMiniView);