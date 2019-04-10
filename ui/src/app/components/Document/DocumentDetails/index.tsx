import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import SectionItem from 'app/components/Common/SectionItem';
import Button from '@material-ui/core/Button';

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
          <Typography className={classes.heading} variant="h4">
            Document Details
          </Typography>
          <Divider/>
          <SectionItem heading={"Name"} description={"Description"} />
          <SectionItem heading={"Name"} description={"Description"} />
          <div className={classes.buttonGroup}>
            <Button variant="contained" className={classes.button}>
              Edit
            </Button>
          </div>
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(DocumentDetails);