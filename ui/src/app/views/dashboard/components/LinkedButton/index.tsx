import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { Divider } from '@material-ui/core';

export function LinkedButton() {
    
return <Link style={{ textDecoration: "none" }} to="/document/create">
        <Button style={{  }} variant={"contained"}>
            Create Document
        </Button>
    </Link>;
}