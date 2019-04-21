import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Radio, Chip, Tooltip, Button } from '@material-ui/core';
import { ArrowRightAlt } from '@material-ui/icons';
import { Fragment } from 'react';

export namespace WorkflowMiniView {
  export interface Props {
    classes?: any
    id: number
    name: string
    stages: { id: number, name: string }[]
    currentStage: number
  }
}
class WorkflowMiniView extends React.Component<WorkflowMiniView.Props, any> {

  constructor(props: WorkflowMiniView.Props) {
    super(props)
    this.state = {}
  }

  render() {

    const { classes, name, stages, currentStage } = this.props;

    return (
      <main className={classes.layout}>
        <Typography className={classes.heading} variant="subtitle1">
          {name}
        </Typography>
        <div className={classes.workflow}>
          {stages.map((stage, idx, arr) => {
            const sep = idx !== arr.length - 1 ? <ArrowRightAlt className={classes.arrow} /> : null

            if (stage.id === currentStage) {
              return (<Fragment>
                <Chip label={stage.name} avatar={<Radio checked={true} className={classes.chip} />} />
                {sep}
              </Fragment>)
            } else {
              return (<Fragment>
                <Tooltip title={stage.name}><Radio key={stage.id} className={classes.radio} /></Tooltip>
                {sep}
              </Fragment>)
            }
          })}
        </div>
        <div className={classes.buttonGroup}>
          <Button variant="contained" className={classes.button}>Back</Button>
          <Button variant="contained" className={classes.button}>Next</Button>
        </div>
      </main>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowMiniView);