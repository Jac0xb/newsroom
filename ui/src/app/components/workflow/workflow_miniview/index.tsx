import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Button, Stepper, Step, StepLabel, Link } from '@material-ui/core';
import { Workflow } from 'app/models/workflow';

export namespace WorkflowMiniView {
  export interface Props {
    classes?: any
    workflow: Workflow
    currentStage: number
  }
}
class WorkflowMiniView extends React.Component<WorkflowMiniView.Props, any> {

  constructor(props: WorkflowMiniView.Props) {
    super(props)
    this.state = {}
  }

  render() {

    const { classes, workflow, currentStage } = this.props;

    return (
      <main className={classes.layout}>
        <Typography className={classes.heading} variant="subtitle1">
          <Link href={"/workflows/" + workflow.id}>
            Workflow: <span style={{ fontWeight: "bold" }}>{workflow.name}</span>
          </Link>
        </Typography>
        <Stepper className={classes.stepper} activeStep={currentStage - 1}>
          {workflow.stages.map((stage) => {
            return (
              <Step key={stage.id}>
                <StepLabel>{stage.name}</StepLabel>
              </Step>)
          })}
        </Stepper>
        <div className={classes.buttonGroup}>
          <Button variant="contained" className={classes.button}>Back</Button>
          <Button variant="contained" className={classes.button}>Next</Button>
        </div>
      </main >
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowMiniView);