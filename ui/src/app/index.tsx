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

export namespace App {
    export interface Props {
        classes?: any 
    }
    export interface State {
		isAuthenticated: Boolean,
    }
}

class App extends React.Component<App.Props, App.State, any> {

	constructor(props: App.Props) {
		super(props)
		this.state = {
		  isAuthenticated: false,
		}
	}

	// TODO: auth thro db
	handleLoginClick = (username: string, password: string) => {
		console.log(username, password)
        this.setState({ isAuthenticated: true })
	};
	// TODO: auth thro db
	handleRegisterClick = (username: string, password: string) => {
		console.log(username, password)
        this.setState({ isAuthenticated: true })
  };

	render(){

		const { isAuthenticated } = this.state;

		return(
            <div className="App" style={{height:"100vh", display:"flex", flexDirection: "column"}}>
				<CssBaseline />
				<PrimarySearchAppBar />
				<Switch>
						{
							!isAuthenticated &&
							<LoginPage loginClick={(username: string, password: string) => this.handleLoginClick(username, password)} registerClick={this.handleRegisterClick} /> 	
						}
						{
							isAuthenticated &&
							<div>
								<Route exact path="/document" component={(() => Dashboard)()} />
								<Route exact path="/document/create" component={DocumentCreator} />
								<Route path="/document/:id/edit" component={DocumentEditor} />
								<Route path="/workflow/:id/edit" component={WorkflowEditor} />
                                <Route path="/users" component={Users}/>
                                <Route path="/groups" component={Groups}/>
								<Route exact path="/workflow" component={Workflow} />
								<Route exact path="/" component={Dashboard} />
							</div>
						}
				</Switch>
            </div>
		);
	}
}
export default hot(module)(App);
