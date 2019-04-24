import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { Typography, Divider, Button } from '@material-ui/core';
import SectionItem from 'app/components/common/section_item';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

export namespace Workflow {
  export interface Props {
    classes?: any
    workflow: any
  }
}
class WorkflowTile extends React.Component<Workflow.Props, any> {

  constructor(props: Workflow.Props) {
    super(props)
    this.state = {}
  }

  render() {
    const { classes, workflow } = this.props;

    return (
		<Paper className={classes.documentItem} key={workflow.id}>
			<Typography className={classNames(classes.heading, classes.noWrap)} variant="h6">
				{workflow.name}
			</Typography>
			<Divider />
			<Typography component="p">
				{(workflow.description === "" ? "(No Description)" : workflow.description)}
			</Typography>
			<div className={classes.buttonGroup}>
				<Link to={"/workflow/" + workflow.id + "/edit"}>
					<Button variant="contained" className={classes.button}>Edit</Button>
				</Link>
			</div>
		</Paper>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WorkflowTile);