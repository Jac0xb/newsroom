import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';

export default function() {
    
return <Link style={{ textDecoration: "none" }} to="/document/create">
        <Button style={{ width: "calc(3*52px)" }} variant={"contained"}>
            New Document
        </Button>
    </Link>;
}