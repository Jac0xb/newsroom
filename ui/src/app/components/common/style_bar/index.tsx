import { withStyles } from '@material-ui/core/styles';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import * as React from "react";
import { styles } from "./styles";

export namespace StyleBar {
    export interface Props {
        onClick: (format: string) => void
        onCreateUpdateFormats: (updateFormats: (formats: string[]) => void) => void
    }
    export interface State {
        formats: string[]
    }
}

class StyleBar extends React.Component<StyleBar.Props, StyleBar.State> {
    constructor(props: StyleBar.Props) {
        super(props)

        props.onCreateUpdateFormats((formats: string[]) => this.setState({ formats: formats }))
    }

    state: StyleBar.State = {
        formats: []
    }

    handleChange(event: React.MouseEvent, format: string) {
        event.preventDefault();
        this.props.onClick(format);
    }

    render() {
        const { formats } = this.state;

        return (
            <ToggleButtonGroup value={formats}>
                <ToggleButton value="BOLD" onMouseDown={(event) => this.handleChange(event, "BOLD")}>
                    <FormatBold />
                </ToggleButton>
                <ToggleButton value="ITALIC" onMouseDown={(event) => this.handleChange(event, "ITALIC")}>
                    <FormatItalic />
                </ToggleButton>
                <ToggleButton value="UNDERLINE" onMouseDown={(event) => this.handleChange(event, "UNDERLINE")}>
                    <FormatUnderlined />
                </ToggleButton>
            </ToggleButtonGroup>
        );
    }
}

export default withStyles(styles, { withTheme: true })(StyleBar);