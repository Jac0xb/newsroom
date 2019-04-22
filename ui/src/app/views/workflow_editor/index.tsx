import { Fab, Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import WorkflowStage from 'app/components/workflow/workflow_stage';
import DialogItem from 'app/components/common/dialog';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';

export namespace WorkflowEditor {
  export interface Props {
    classes?: any
    match: {
      params: {
        id: number
      }
    }
  }
  export interface State {
    stages: Array<any>
    createDialogOpen: boolean
    editDialogOpen: boolean
    stageID?: number
  }
}
class WorkflowEditor extends React.Component<WorkflowEditor.Props, WorkflowEditor.State, any> {

  constructor(props: WorkflowEditor.Props) {
    super(props)
    this.state = {
      stages: [],
      createDialogOpen: false,
      editDialogOpen: false,
    }
  }

  componentDidMount() {
    const id = this.props.match.params.id;

    axios.get("/api/workflows/" + id + "/stages").then((response) => {
      console.log(response);

      const stages = response.data;

      this.setState({ stages: stages })
    })
  }

  handleStageAddClick(open: boolean) {
    this.setState({ createDialogOpen: open });
  };

  handleStageEditClick = (id: number) => {
    console.log(id)

    this.setState({ editDialogOpen: true, stageID: id});

  };

  handleAddStage = (textBoxName: string, textBoxDesc: string) => {
    const id = this.props.match.params.id;

    axios.post("/api/workflows/" + id + "/stages", {
      name: textBoxName,
      creator: "Jacques",
      description: textBoxDesc,
    }).then((response) => {

      console.log(response);

      // TODO: will need actual index stored in db
      const index = response.data.id + 1;
      
      // add stage to list 
      this.state.stages.splice(index, 0, response.data)

      // reset text boxes, close dialog
      this.setState({ createDialogOpen: false});
    });
  };

  handleStageEdit = (textBoxName: string, textBoxDesc: string) => {
    
    const id = this.props.match.params.id;
    console.log(this.state.stageID)

    axios.post("/api/workflows/" + id + "/stages", {
      id: this.state.stageID,
      name: textBoxName,
      creator: "Jacques",
      description: textBoxDesc,
    }).then((response) => {

      console.log(response);

      // TODO
      this.componentDidMount();
      // WILL RERENDER LIST
    
      // reset text boxes, close dialog
      this.setState({ editDialogOpen: false });
    });

  };

  render() {

    const { classes } = this.props;
    const { stages, createDialogOpen, editDialogOpen } = this.state;

    return (
      <React.Fragment>
        <PrimarySearchAppBar />
        <main className={classes.layout}>
          <Grid container spacing={16}>
            <Fab size="small" color="secondary" aria-label="Add" onClick={() => this.handleStageAddClick(true)} className={classes.fab}>
              <AddIcon />
            </Fab>
            {stages.map((stage, index) => (
              <div className={classes.stagePlusButton}>
                <Grid key={index} className={classes.stageGrid} item>
                  <WorkflowStage id={stage.id} name={stage.name} desc={stage.description} onClick={(id: number) => this.handleStageEditClick(id)} />
                </Grid>
                <Fab size="small" color="secondary" aria-label="Add" onClick={() => this.handleStageAddClick(true)} className={classes.fab}>
                  <AddIcon />
                </Fab>
              </div>
            ))}
          </Grid>
          
          <DialogItem title={"Create New Stage"} desc={"Enter new stage information"} show={createDialogOpen} handleSave={this.handleAddStage}/>
          <DialogItem title={"Edit Stage"} desc={"Enter stage information"} show={editDialogOpen} handleSave={this.handleStageEdit}/>
        </main>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowEditor);