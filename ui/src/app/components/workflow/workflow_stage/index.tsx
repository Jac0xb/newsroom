import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Divider, Button, Grid } from '@material-ui/core';
import SectionItem from 'app/components/common/section_item';
import DocumentTile from 'app/components/dashboard/DocumentTile';
import axios from 'axios';

export namespace WorkflowStage {
    export interface Props {
        classes?: any 
        id: number
        name: string
        desc: string
        onClick: Function
    }
    export interface State {
      documents: any[]
    }
}
class WorkflowStage extends React.Component<WorkflowStage.Props, WorkflowStage.State, any> {

  constructor(props: WorkflowStage.Props) {
      super(props)
      this.state = {
        documents: []
      }
  }

  componentDidMount() {

		axios.get("/api/documents").then((response) => {
			console.log(response.data);

			const documents = response.data;

			this.setState({ documents })
		});
	}
  
  render() {

    const { classes } = this.props;
    const { documents } = this.state;

		const docList = documents.map((document, i) =>
			<DocumentTile key={i} document={document} />
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