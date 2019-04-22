import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Typography, Divider, Button } from '@material-ui/core';
import SectionItem from 'app/components/common/section_item';
import { Link } from 'react-router-dom'

export namespace Workflow {
  export interface Props {
    classes?: any
    workflow: any
  }
}
class Workflow extends React.Component<Workflow.Props, any> {

  constructor(props: Workflow.Props) {
    super(props)
    this.state = {}
  }

  render() {
    const { classes, workflow } = this.props;

    return (
      	<main className={classes.layout}>
			<Paper className={classes.paper} key={workflow.id}>
				<Typography className={classes.heading} variant="h6">
					{workflow.name}
				</Typography>
				<Divider />
				<SectionItem heading={"Description"} description={workflow.description} />
				<Link to={"/workflow/" + workflow.id + "/edit"}>
					<Button variant="contained" className={classes.button}>Edit</Button>
				</Link>
			</Paper>
      	</main>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Workflow);