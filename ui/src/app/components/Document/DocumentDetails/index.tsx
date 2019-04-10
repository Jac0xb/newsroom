import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'

export namespace DocumentDetails {
    export interface Props {
        classes?: any
    }
}
class DocumentDetails extends React.Component<DocumentDetails.Props, any> {

  constructor(props: DocumentDetails.Props) {
      super(props)
  }

  render() {

    const { classes } = this.props;

    return (
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          Example
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles)(DocumentDetails);