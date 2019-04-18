import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Grid } from '@material-ui/core';

export namespace WorkflowEditor {
    export interface Props {
        classes?: any 
    }
}
class WorkflowEditor extends React.Component<WorkflowEditor.Props, any> {

  constructor(props: WorkflowEditor.Props) {
      super(props)
      this.state = {
        stages: [],
      }
  }
  
  render() {

    const { classes } = this.props;
    const { stages } = this.state;

    return (
      <React.Fragment>
				<PrimarySearchAppBar/>
        <main className={classes.layout}>

          <Grid container justify="center" spacing={16}>
              {/* {stages.map(stage => (
              <Grid key={stage} item>
                  {stage}
              </Grid>
              ))} */}
          </Grid>
        </main>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowEditor);