import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Button, Stepper, Step, StepLabel, Grid } from '@material-ui/core';
import { Workflow } from 'app/models/workflow';
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@material-ui/core';

export namespace WorkflowMiniView {
  export interface Props {
    classes?: any
    workflow: Workflow
    currentStage: number
    onMove: (direction: string) => void
  }
}
class WorkflowMiniView extends React.Component<WorkflowMiniView.Props, any> {

  constructor(props: WorkflowMiniView.Props) {
    super(props)
    this.state = {}
  }

  render() {

    const { classes, workflow, currentStage } = this.props;

    const workflowRouterLink = (props: any) => <RouterLink to={"/workflow/" + workflow.id + "/edit"} {...props} />

    return (
      <main className={classes.layout}>
        <div className={classes.header}>
          <Typography variant="subtitle1">
            <Link component={workflowRouterLink}>
              Workflow: <span style={{ fontWeight: "bold" }}>{workflow.name}</span>
            </Link>
          </Typography>
          <Button variant="contained" size="small"
            disabled={currentStage == 0}
            onClick={() => this.props.onMove("prev")}>Back</Button>
          <Button variant="contained" size="small"
            disabled={currentStage == workflow.stages.length - 1}
            onClick={() => this.props.onMove("next")}>Next</Button>
        </div>
        <Stepper orientation="vertical" className={classes.stepper} activeStep={currentStage}>
          {workflow.stages.map((stage) => {
            return (
              <Step key={stage.id}>
                <StepLabel>
                  {stage.name}
                  <Typography variant="caption">{stage.description}</Typography>
                </StepLabel>
              </Step>)
          })}
        </Stepper>
      </main >
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowMiniView);