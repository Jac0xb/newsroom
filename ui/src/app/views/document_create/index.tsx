import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Grid, Paper, Button, FormGroup, FormLabel, TextField, MenuItem } from '@material-ui/core';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'

export namespace DocumentCreate {
	export interface Props {
		classes?: any
		match?: { params: any }
	}
	export interface State {
		nickname?: string
		workflow?: string
		availableWorkflows: {name: string, id: number}[]
	}
}

// Add refresh button to workflows.
class DocumentCreate extends React.Component<DocumentCreate.Props, DocumentCreate.State> {

	constructor(props: DocumentCreate.Props, context?: any) {
		super(props, context);
		this.state = {nickname: undefined, workflow: "undefined", availableWorkflows : []}
	}

	componentDidMount() {
		//const id = this.props.match.params.id;
	
		axios.get("/api/workflows").then((response) => {
		  console.log(response.data);
	
		  const workflows = response.data;
	
		  this.setState({ availableWorkflows: workflows })
		});
	}

	render() {

		const { classes } = this.props;

		return (
			<React.Fragment>
				<PrimarySearchAppBar />
				<Grid className={classes.outerGrid} alignContent={"center"} container spacing={24} direction="row" justify="center" alignItems="center">
					<Grid item xs={8} md={6}>
						<Paper className={classes.formGroup}>
							<FormGroup>
								<FormLabel>Document Creator</FormLabel>
								<TextField
									label="Document Nickname"
									placeholder="Brown: Utah Ute's Win The Holy War Against BYU"
									margin="normal"
									variant="filled"
									value={this.state.nickname}
									onChange={(c) => this.setState({nickname: c.target.value})}
									InputLabelProps={{
										shrink: true,
									}}
								/>
								<TextField
									select
									label="Document Nickname"
									margin="normal"
									variant="filled"
									value={this.state.workflow}
									onChange={(c) => this.setState({workflow: c.target.value})}
									InputLabelProps={{
										shrink: true,
									}}
								>
								{this.state.availableWorkflows.map(workflow => (
									<MenuItem key={workflow.id} value={workflow.id}>
									  {workflow.name}
									</MenuItem>
								  ))}
								</TextField>
							</FormGroup>
						</Paper>
					</Grid>
				</Grid>
			</React.Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(DocumentCreate);
