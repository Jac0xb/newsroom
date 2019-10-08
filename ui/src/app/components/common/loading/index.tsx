import { styles } from './styles';
import * as React from 'react';
var image = require("./download.svg");


export function LoadingComponent() {
    
    const classes = styles();

    return (<img src={String(image)} className={classes.loading} />);

}