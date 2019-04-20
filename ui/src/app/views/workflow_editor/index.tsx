import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Grid, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import WorkflowStage from 'app/components/workflow/workflow_stage';

export namespace WorkflowEditor {
    export interface Props {
        classes?: any 
    }
    export interface State {
      stages: Array<any>
      stagesCount: number
    }
}
class WorkflowEditor extends React.Component<WorkflowEditor.Props, WorkflowEditor.State, any> {

  constructor(props: WorkflowEditor.Props) {
      super(props)
  }

  state: WorkflowEditor.State = {
    stages: [<WorkflowStage id={0} name={"Stage"} onClick={(id: number) => this.handleClick(id)}/>],
    stagesCount: 0,
  }

  handleAddNew = (index: number) => {
    // add stage 
    this.state.stages.splice(index+1, 0, <WorkflowStage id={index+1} name={"Stage inserted after pos " + index.toString()} onClick={(id: number) => this.handleClick(id)}/>)

    // setState will re-render the view
    this.setState({ stages: this.state.stages} );
  };

  handleClick = (id : number) => {
    console.log(id)
  };
  render() {

    const { classes } = this.props;
    const { stages } = this.state;

		return (
      <React.Fragment>
				<PrimarySearchAppBar/>
        <main className={classes.layout}>

          <Grid container spacing={16}>
              {stages.map((stage, index) => (
              <div className={classes.stagePlusButton}>
                <Grid key={index} className={classes.stageGrid} item>
                  {stage}
                </Grid>
                <Fab size="small" color="secondary" aria-label="Add" onClick={() => this.handleAddNew(index)} className={classes.fab}>
                  <AddIcon />
                </Fab>
              </div>
              ))}
              
          </Grid>
        </main>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowEditor);