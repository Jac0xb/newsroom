import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Divider, Button } from '@material-ui/core';
import SectionItem from 'app/components/common/section_item';

export namespace WorkflowStage {
    export interface Props {
        classes?: any 
        id: number
        name: string
        onClick: Function
    }
}
class WorkflowStage extends React.Component<WorkflowStage.Props, any> {

  constructor(props: WorkflowStage.Props) {
      super(props)
      this.state = {
      }
  }
  
  render() {

    const { classes } = this.props;

    return (
      <main className={classes.layout}>
        <Paper className={classes.stage} key={this.props.id} onClick={() => this.props.onClick(this.props.id)}>
          <Typography className={classes.heading} variant="title">
          {this.props.name}
          </Typography>
          <Divider/>
          <SectionItem heading={"Description"} description={"This is a stage in a workflow"} />
					<div className={classes.buttonGroup}>
						<Button variant="contained" className={classes.button}>Edit</Button>
					</div>
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowStage);