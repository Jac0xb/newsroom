import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Divider, Button, Grid } from '@material-ui/core';
import SectionItem from 'app/components/common/section_item';
import DocumentTile from 'app/components/dashboard/DocumentTile';

export namespace WorkflowStage {
    export interface Props {
        classes?: any 
        id: number
        name: string
        desc: string
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

    const documents = ["Document", "Document"]

		const docList = documents.map((name, i) =>
			<DocumentTile id={i} name={name} author="Jacob Brown" workflow="Opinion Desk" duedate="4/20/2019" />
		);

    return (
      <main className={classes.layout}>
        <Paper className={classes.stage} key={this.props.id} onClick={() => this.props.onClick(this.props.id)}>
          <Typography className={classes.heading} variant="title">
          {this.props.name}
          </Typography>
          <Divider/>
          <SectionItem heading={"Description"} description={this.props.desc} />
          <Grid className={classes.documentGrid} container spacing={16}>
            {docList}
          </Grid>
					<div className={classes.buttonGroup}>
						<Button variant="contained" className={classes.button}>Edit</Button>
					</div>
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowStage);