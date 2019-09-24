import * as React from 'react';
// Nagivational React components that are composed declaratively.
import { Route, Switch } from 'react-router-dom';
// Style-Normalization (https://material-ui.com/style/css-baseline/)
import CssBaseline from '@material-ui/core/CssBaseline';
// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';
import Dashboard from './views/dashboard_overview';
import DocumentEditor from './views/document_editor';
import WorkflowEditor from './views/workflow_editor'
import WorkflowOverview from '../app/views/workflow_overview/index';
import DocumentCreator from './views/document_create';
import Users from "app/views/users";
import Groups from "app/views/groups";
import Group from "app/views/group";
import GroupCreate from './views/group_create';
import AppHeader from 'app/components/common/header';
import LoginPage from './views/login_page';
import axios from 'axios';
import { User } from './models';

// Store
import { WorkflowState } from "../store/workflow/types"
import { addStage } from "../store/workflow/actions";

export namespace App {
    export interface Props {
        classes?: any
    }

    export interface State {
        isAuthenticated: Boolean,
        users: User[]
    }
}

interface AppProps {
    addStage: typeof addStage;
    workflow: WorkflowState;
  }

class App extends React.Component<App.Props, App.State, any> {

    constructor(props: App.Props) {
        super(props);
        this.state = {
            isAuthenticated: false,
            users: []
        }
    }

    componentDidMount() {
        axios.get("/api/users/1").then((response) => {
            this.setState({isAuthenticated: response.status != 401});
        }).catch((error) => console.log(error))
    };

    render() {

        const {isAuthenticated} = this.state;

        if (!isAuthenticated) {
            return (
                <React.Fragment>
                    <AppHeader loggedOut={true}/>
                    <div style={{marginTop: "64px"}}>
                        <LoginPage/>
                    </div>
                </React.Fragment>
            )
        }

        return (
            <React.Fragment>
                <CssBaseline/>
                <AppHeader />
                <div style={{marginTop: "64px"}}>
                    <Switch>
                        <Route exact path="/document" component={Dashboard}/>
                        <Route exact path="/document/create" component={DocumentCreator}/>
                        <Route exact path="/groups_create" component={GroupCreate}/>
                        <Route exact path="/groups" component={Groups}/>
                        <Route exact path="/workflow" component={WorkflowOverview}/>
                        <Route exact path="/" component={Dashboard}/>
                        <Route path="/document/:id/edit" component={DocumentEditor}/>
                        <Route path="/workflow/:id/edit" component={WorkflowEditor}/>
                        <Route path="/users" component={Users}/>
                        <Route path="/groups/:id" component={Group}/>
                    </Switch>
                </div>
            </React.Fragment>
        );
    }
}

// const mapStateToProps = (state: AppState) => ({
//     workflow: state.workflow,
//   });

export default hot(module)(App);
