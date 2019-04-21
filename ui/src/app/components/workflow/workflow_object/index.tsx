import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Divider } from '@material-ui/core';
import SectionItem from 'app/components/common/section_item';

export namespace WorkflowContents {
    export interface Props {
        classes?: any 
        id: number
        name: string
        onClick: Function
    }
}
class WorkflowContents extends React.Component<WorkflowContents.Props, any> {

  constructor(props: WorkflowContents.Props) {
      super(props)
      this.state = {
      }
  }
  
  render() {

    const { classes } = this.props;

    return (
      <main className={classes.layout}>
        <Paper className={classes.paper} key={this.props.id} onClick={() => this.props.onClick(this.props.id)}>
          <Typography className={classes.heading} variant="h6">
          {this.props.name}
          </Typography>
          <Divider/>
          <SectionItem heading={"Description"} description={"This is a workflow instance"} />
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowContents);