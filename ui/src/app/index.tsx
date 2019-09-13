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
import Workflow from './views/workflow_overview';
import DocumentCreator from './views/document_create';
import Users from "app/views/users";
import Groups from "app/views/groups";
import Group from "app/views/group";
import GroupCreate from './views/group_create';
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

	// Login, Auth with backend TODO: google auth
	handleLoginClick = (username: string, password: string) => {

        axios.get("/api/users").then((response: any) => {
            console.log(response.data)
            response.data.forEach((user: User) => {
                // If username and password match in the database
                if (user.name === username && user.password === password) {

                    // Set isAuthenticated to true and cookie to id and return
                    this.setState({ isAuthenticated: true })
                    localStorage.setItem("userID", user.id.toString())
                    return
                }
            });
        }).catch((error) => {
            console.log(error)
        });
		
	};
	// Add new user to backend
	handleRegisterClick = (userName: string, firstName: string, lastName: string, password: string, email: string = `${Math.floor((Math.random()*1000))}@newsroom.com`) => {
		
		axios.post("/api/users", { userName, firstName, lastName, password, email }).then((response: any) => {

            // Set cookie and authenticated
			this.setState({ isAuthenticated: true })
            localStorage.setItem("userID", response.data.id)
        
        }).catch((error) => {
            console.log(error)
        });
		
  };

	render(){

        const { isAuthenticated } = this.state;
        
        if (!isAuthenticated) {
            return(
                <React.Fragment>
                    <PrimarySearchAppBar />
                    <LoginPage loginClick={(username: string, password: string) => this.handleLoginClick(username, password)} registerClick={this.handleRegisterClick} />
                </React.Fragment>
            )
        }

		return(
            <React.Fragment>
                <CssBaseline />
                <PrimarySearchAppBar />
                <div style={{ marginTop: "64px" }}>
                    <Switch>
                        <Route exact path="/document" component={Dashboard} />
                        <Route exact path="/document/create" component={DocumentCreator} />
                        <Route exact path="/groups_create" component={GroupCreate} />
                        <Route exact path="/groups" component={Groups} />
                        <Route exact path="/workflow" component={Workflow} />
                        <Route exact path="/" component={Dashboard} />
                        <Route path="/document/:id/edit" component={DocumentEditor} />
                        <Route path="/workflow/:id/edit" component={WorkflowEditor} />
                        <Route path="/users" component={Users} />
                        <Route path="/groups/:id" component={Group} />
                    </Switch>
                </div>
            </React.Fragment>
		);
	}
}
export default hot(module)(App);
