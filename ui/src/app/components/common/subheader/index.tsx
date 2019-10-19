import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from "./styles";
import { AppBar, Tabs, Tab } from '@material-ui/core';

export namespace Subheader {


    export interface Props {
        classes: Record<string, string>;
        onTabChange: (sequenceID: number) => void;
        tabs: string[]
    }

    export interface State {
        sideMenuOpen: boolean;
    }


    export class Component extends React.Component<Subheader.Props, Subheader.State> {

        constructor(props: Subheader.Props) {
            super(props)
        }
    
        // For scrollable stage tabs
        a11yProps(index: any) {
            return {
                id: `scrollable-auto-tab-${index}`,
                'aria-controls': `scrollable-auto-tabpanel-${index}`,
            };
        }

        render() {
    
            return (                    
            <AppBar color="default" style={{zIndex: 1000, position: "fixed", top:"64px"}}>
                <Tabs
                    value={0}
                    onChange={(_event: React.ChangeEvent<{}>, sequenceID: number) => this.props.onTabChange(sequenceID)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                >
                    {
                        this.props.tabs.map((tabName: string, i: number) => <Tab label={tabName} {...this.a11yProps(i)} />)
                    }
                </Tabs>
            </AppBar>);
        }
    }
}

export default withStyles(styles)(Subheader.Component);