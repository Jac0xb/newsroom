import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Theme, StyleRules, withStyles} from '@material-ui/core/styles';

const styles = (theme: Theme) =>  {
    return ({
        item: {
            marginTop: 20   // TOOD: Replace with theme.unit.spacing
        }
    } as StyleRules) 
};

const SectionItem = (props: any) => {

        const { classes, heading, description } = props;

        return (
        <div className={classes.item}>
            <Typography variant="h6">
                {heading}
            </Typography>
            <Typography component="p">
                {description}
            </Typography>
        </div>
        )
}

export default withStyles(styles, {withTheme: true})(SectionItem);