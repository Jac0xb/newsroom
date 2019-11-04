import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from "./styles";
import { AppBar, Tabs, Tab } from '@material-ui/core';

export namespace Subheader {


    export interface Props {
        classes: Record<string, string>;
        onTabChange: (sequenceID: number) => void;
        tabs: string[];
        selectedTab: number;
    }

    export interface State {
        sideMenuOpen: boolean; 
    }


    export class Component extends React.Component<Subheader.Props, Subheader.State> {

        constructor(props: Subheader.Props) {
            super(props)
        }

        render() {
            const { classes } = this.props;
            
            var tabs = this.props.tabs.map((tabName: string, index: number) => {
                
                return <Tab key={index} label={tabName} value={index}/>
            
            });

            //var tabs = [...tabs, <Tab key={tabs.length} label={<div>+</div>} value={-1} />]

            return (                    
            <AppBar color="default" className={classes.appBar}>
                <Tabs
                    value={this.props.selectedTab}
                    onChange={(_event: React.ChangeEvent<{}>, sequenceID: number) => this.props.onTabChange(sequenceID)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                >
                    {tabs}
                </Tabs>
            </AppBar>);
        }
    }
}

export default withStyles(styles)(Subheader.Component);