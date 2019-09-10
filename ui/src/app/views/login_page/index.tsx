import { Grid, Paper, Typography, TextField, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { styles } from './styles';

export namespace LoginPage {
  export interface Props {
    classes?: any
    loginClick: Function
    registerClick: Function
  }
  export interface State {
    username: string
    password: string
    registering: boolean
  }
}
class LoginPage extends React.Component<LoginPage.Props, LoginPage.State, any> {


    constructor(props: LoginPage.Props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            registering: false,
        }
    }

    handleTextChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {

        if(name == "username")
            this.setState({ username: event.target.value });
        if(name == "password")
            this.setState({ password: event.target.value });
    };

    toggleRegisterForm = () => {
        this.setState({ registering: !this.state.registering });
    };

    render() {

        const { classes, loginClick, registerClick } = this.props;
        const { username, password, registering } = this.state;

        return (
        <React.Fragment>
            <main>
                <div className={classes.loginBox} hidden={registering}>
                    <Grid container className={classes.grid} justify="center">
                        <Paper className={classes.paper} elevation={1}>
                            <Typography variant="h5" component="h3">
                                Login 
                            </Typography>
                            <TextField
                                onChange={this.handleTextChange("username")}
                                id="username-required"
                                label="Username"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                                value={username}
                                
                            />
                            <TextField
                                onChange={this.handleTextChange("password")}
                                id="password-required"
                                label="Password"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                                value={password}
                                type={'password'}
                            />
                            <Grid container className={classes.grid} justify="center">
                                <Button variant="contained" className={classes.loginButton} onClick={() => loginClick(username,password)}>Login</Button>
                            </Grid>
                            <Grid container className={classes.register} justify="center">
                                <a href="#" onClick={() => this.toggleRegisterForm()}>Register</a>
                            </Grid>
                        </Paper>
                    </Grid>
                </div>

                <div className={classes.loginBox}  hidden={!registering}>
                    <Grid container className={classes.grid} justify="center">
                        <Paper className={classes.paper} elevation={1}>
                            <Typography variant="h5" component="h3">
                                Register 
                            </Typography>
                            <TextField
                                required
                                onChange={this.handleTextChange("username")}
                                id="username-required"
                                label="Username"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                                value={username}
                                
                            />
                            <TextField
                                required
                                onChange={this.handleTextChange("password")}
                                id="password-required"
                                label="Password"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                                value={password}
                                type={'password'}
                            />
                            <Grid container className={classes.grid} justify="center">
                                <Button variant="contained" className={classes.button} onClick={() => registerClick(username,password)}>Register</Button>
                            </Grid>
                            <Grid container className={classes.register} justify="center">
                                <a href="#" onClick={() => this.toggleRegisterForm()}>Have an account? Sign In</a>
                            </Grid>
                        </Paper>
                    </Grid>
                </div>
            </main>
        </React.Fragment>
        );
    }
}

export default withStyles(styles, { withTheme: true })(LoginPage);