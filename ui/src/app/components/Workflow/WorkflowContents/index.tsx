import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'

export namespace WorkflowContents {
    export interface Props {
        classes?: any
    }
}
class WorkflowContents extends React.Component<WorkflowContents.Props, any> {

  constructor(props: WorkflowContents.Props) {
      super(props)
  }

  render() {

    const { classes } = this.props;

    return (
        
        <Paper className={classes.paper} />

    //   <main className={classes.layout}>
    //     <Paper className={classes.paper}>
    //       <Typography className={classes.heading} variant="h4">
    //         Document Details
    //       </Typography>
    //       <Divider/>
    //       <SectionItem heading={"Name"} description={"Description"} />
    //       <SectionItem heading={"Name"} description={"Description"} />
    //       <div className={classes.buttonGroup}>
    //         <Button variant="contained" className={classes.button}>
    //           Edit
    //         </Button>
    //       </div>
    //     </Paper>
    //   </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowContents);