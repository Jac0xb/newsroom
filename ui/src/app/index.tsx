import * as React from 'react';

// Nagivational React components that are composed declaratively.
import { Route, Switch } from 'react-router-dom';

// Style-Normalization (https://material-ui.com/style/css-baseline/)
import CssBaseline from '@material-ui/core/CssBaseline';

// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';

// Newsroom the application.
import Dashboard from './views/dashboard_overview';
import DocumentEditor from './views/document_editor';
import WorkflowEditor from './views/workflow_editor'
import Workflow from './views/workflow_page';
import DocumentCreator from './views/document_create';
import Users from "app/views/users";
import Groups from "app/views/groups";
import PrimarySearchAppBar from 'app/components/common/header';
import LoginPage from './views/login_page';
import axios from 'axios';
import { User } from './models';

export namespace App {
    export interface Props {
        classes?: any 
    }
    export interface State {
		isAuthenticated: Boolean,
		users: User[]
    }
}

class App extends React.Component<App.Props, App.State, any> {

	constructor(props: App.Props) {
		super(props)
		this.state = {
		  isAuthenticated: false,
		  users: []
		}
	}

	componentDidMount(){
		// TODO
		if(localStorage.getItem("userID") != null){
			this.setState({ isAuthenticated: true })
		}
		else{
			this.setState({ isAuthenticated: false })
		}
	};

	// TODO: auth thro db
	handleLoginClick = (username: string, password: string) => {

		axios.get("/api/users").then((response: any) => {
			try {
				response.data.forEach( (user: User) => {
						// If username and password match in the database
						if (user.name === username && user.password === password){

							// Set isAuthenticated to true and cookie to id and return
							this.setState({ isAuthenticated: true })
							localStorage.setItem("userID", user.id.toString())
							return
						}	
				});

				// TODO: Else, not found in db


			} catch (error) {
				console.log(error)
			}
		});
		
	};
	// TODO: auth thro db
	handleRegisterClick = (username: string, firstName: string, lastName: string, password: string) => {
		
		axios.post("/api/users", {
			name: username,
			firstName: firstName,
			lastName: lastName,
            password: password,

        }).then((response: any) => {
            console.log(response);

            // Set cookie and authenticated
			this.setState({ isAuthenticated: true })
			localStorage.setItem("userID", response.data.id)
		});
		
  };

	render(){

		const { isAuthenticated } = this.state;

		return(
			<React.Fragment>
				<CssBaseline />
				<PrimarySearchAppBar />
				<Switch>
					<div className="App">
						{
							!isAuthenticated &&
							<LoginPage loginClick={(username: string, password: string) => this.handleLoginClick(username, password)} registerClick={this.handleRegisterClick} /> 	
						}
						{
							isAuthenticated &&
							<div>
								<Route exact path="/document" component={Dashboard} />
								<Route exact path="/document/create" component={DocumentCreator} />
								<Route path="/document/:id/edit" component={DocumentEditor} />
								<Route path="/workflow/:id/edit" component={WorkflowEditor} />
                                <Route path="/users" component={Users}/>
                                <Route path="/groups" component={Groups}/>
								<Route exact path="/workflow" component={Workflow} />
								<Route exact path="/" component={Dashboard} />
							</div>
						}
					</div>
				</Switch>
			</React.Fragment>
		);
	}
}
export default hot(module)(App);
