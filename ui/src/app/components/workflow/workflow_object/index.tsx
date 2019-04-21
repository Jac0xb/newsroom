import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Divider } from '@material-ui/core';
import SectionItem from 'app/components/common/section_item';

export namespace WorkflowContents {
  export interface Props {
    classes?: any
    workflow: any
  }
}
class WorkflowContents extends React.Component<WorkflowContents.Props, any> {

  constructor(props: WorkflowContents.Props) {
    super(props)
    this.state = {}
  }

  onClick(id: number) {
    window.location.href = "/workflow/" + id + "/edit"
  }

  render() {
    const { classes, workflow } = this.props;

    return (
      <main className={classes.layout}>
        <Paper className={classes.paper} key={workflow.id} onClick={() => this.onClick(workflow.id)}>
          <Typography className={classes.heading} variant="h6">
            {workflow.name}
          </Typography>
          <Divider />
          <SectionItem heading={"Description"} description={"This is a workflow instance"} />
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowContents);