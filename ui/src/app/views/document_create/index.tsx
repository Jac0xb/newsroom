import * as React from 'react';
import { Grid, Paper, FormGroup, FormLabel, TextField, MenuItem, Button, Typography } from '@material-ui/core';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Redirect, Link } from 'react-router-dom';
import { withCookies, Cookies } from 'react-cookie';
import { compose } from 'recompose';

export namespace DocumentCreate {
	export interface Props {
		classes: Record<string, string>
		match?: { params: any }
		cookies: Cookies
	}
	export interface State {
		nickname?: string
		workflow?: number
		availableWorkflows: { name: string, id: number }[]
		submitted: boolean
		flash?: string
	}
}

// Add refresh button to workflows.
class DocumentCreate extends React.Component<DocumentCreate.Props, DocumentCreate.State> {

	constructor(props: DocumentCreate.Props, context?: any) {
		super(props, context);
		this.state = { nickname: "", workflow: -1, availableWorkflows: [], submitted: false, flash: "" }
	}

	componentDidMount() {
		//const id = this.props.match.params.id;

		axios.get("/api/workflows").then((response) => {
			console.log(response.data);

			const workflows = response.data;

			this.setState({ availableWorkflows: workflows })
		});
	}

	onSubmit() {
		this.setState({ flash: "" })

		axios.post("/api/documents", { name: this.state.nickname, creator: "Test", workflow: this.state.workflow }).then((response: any) => {

			if (response) {
				this.setState({ submitted: true })
			}

		}).catch((error) => {
			this.setState({ flash: error.response.data.message });
		});
	}

	render() {

		if (this.state.submitted) {
			return <Redirect push to="/" />;
		}

		const { classes, cookies } = this.props;

		return (
			<React.Fragment>
                <div className={classes.buttonGroup}>
					<Link style={{ textDecoration: "none" }} to="/">
						<Button style={{ width: "calc(4*52px)" }} variant={"contained"}>
							Back to Dashboard
						</Button>
					</Link>
				</div>
				<Grid className={classes.outerGrid} alignContent={"center"} container spacing={24} direction="row" justify="center" alignItems="center">
					<Grid item xs={8} md={6}>
						<Paper className={classes.formGroup}>
							{(this.state.flash != "") ?
								<Paper className={classes.flashMessage}>
									<Typography variant="caption">
										{this.state.flash}
									</Typography>
								</Paper> :
								<div></div>
							}
							<FormGroup>
								<FormLabel>Document Creator</FormLabel>
								<TextField
									label="Document Nickname"
									placeholder="Brown: Utah Ute's Win The Holy War Against BYU"
									margin="normal"
									variant="filled"
									value={this.state.nickname}
									onChange={(c) => this.setState({ nickname: c.target.value })}
									InputLabelProps={{
										shrink: true,
									}}
								/>
								<TextField
									select
									label="Workflow"
									margin="normal"
									variant="filled"
									value={this.state.workflow}
									onChange={(c) => this.setState({ workflow: parseInt(c.target.value) })}
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
								<TextField
									disabled={true}
									label="Author"
									margin="normal"
									variant="filled"
									value={cookies.get("username")}
									//onChange={(c) => this.setState({ nickname: c.target.value })}
									InputLabelProps={{
										shrink: true,
									}}
								/>
							</FormGroup>
							<Button variant="contained" onClick={this.onSubmit.bind(this)} className={classes.button}>Create</Button>
						</Paper>
					</Grid>
				</Grid>
			</React.Fragment>
		);
	}
}

export default compose<DocumentCreate.Props, {}>(
	withStyles(styles, { withTheme: true }),
	withCookies
)(DocumentCreate);