import { Paper, Typography, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { styles } from './styles';

import { compose } from 'recompose';
import { connect } from 'react-redux';
import { mapDispatchToProps } from 'app/store/meta/actions';
import { mapStateToProps } from 'app/store/meta/reducers';
import { MetaReducerState, MetaDispatchers } from 'app/store/meta/types';
import { Redirect } from 'react-router-dom';

export namespace Login {
    export interface Props extends MetaReducerState, MetaDispatchers {
        classes?: any;
    }

    export interface State {
        loginTriggered: boolean;
    }

    export class Component extends React.Component<Login.Props, Login.State> {
        constructor(props: Login.Props) {
            super(props);

            this.state = { loginTriggered: false };
        }
    
        handleLogin() {
            //this.setState({loginTriggered: true})
            window.location.href = "/auth/google";
        }
    
        render() {
            const { classes } = this.props;
            
            if (this.state.loginTriggered) {
                return <Redirect to="/auth/google" />;
            }

            return (
                <main className={classes.main}>
                    <Paper className={classes.paper} elevation={1}>
                        <Typography className={classes.title} variant="h5" component="h3">
                            User Login
                        </Typography>
                        <Typography className={classes.subtitle} variant="body1" component="div">
                            To login, please click the link below.
                        </Typography>
                        <Button variant="contained"
                            className={classes.button}
                            color={"primary"}
                            onClick={() => this.handleLogin()}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                                className={classes.googleImage}
                                alt="Google Logo"
                                width={30}
                                height={30} />
                            Sign In with Google
                        </Button>
                    </Paper>
                </main>
            );
        }
    }
}

export default compose<Login.Props, {}>(
    withStyles(styles, {withTheme: true}),
)(connect<Login.Props>(
    mapStateToProps,
    mapDispatchToProps
)(Login.Component));