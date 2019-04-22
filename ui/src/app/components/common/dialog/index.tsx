import React from 'react';
import { styles } from './styles'
import {withStyles} from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from '@material-ui/core';

export namespace DialogItem {
    export interface Props {
        classes?: any 
        desc: string
        title: string
        show: boolean
        handleSave: Function
    }
    export interface State {
        textBoxName: string
        textBoxDesc: string
        open: boolean
    }
}
class DialogItem extends React.Component<DialogItem.Props, DialogItem.State, any> {

  constructor(props: DialogItem.Props) {
      super(props)
      this.state = {
        textBoxName: "",
        textBoxDesc: "",
        open: false,
      }
  }
  
  handleTextBoxesChange = (name: keyof DialogItem.State) => (event: React.ChangeEvent<HTMLInputElement>) => {

    if(name == "textBoxName"){
        this.setState({ textBoxName: event.target.value });
    }
    if(name == "textBoxDesc"){
        this.setState({ textBoxDesc: event.target.value });
    }
  };
  
  handleOpen(open: boolean) {
    this.setState({ open: open });
    //this.props.show = open;
  };

  render() {

        const { classes, title, desc, show, handleSave} = this.props;
        const {textBoxName, textBoxDesc} = this.state;

        return (
        <div className={classes.item}>
            <Dialog className={classes.dialog}
            disableBackdropClick
            disableEscapeKeyDown
            open={show}
            onClose={() => this.handleOpen(false)}>
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent>
              <DialogContentText>{desc}</DialogContentText>
              <form className={classes.container} noValidate autoComplete="off">
                <TextField
                  id="stage-name"
                  label="Name"
                  className={classes.textField}
                  value={textBoxName}
                  onChange={this.handleTextBoxesChange('textBoxName')}
                />
                <TextField
                  id="stage-desc"
                  label="Description"
                  className={classes.textField}
                  value={textBoxDesc}
                  onChange={this.handleTextBoxesChange('textBoxDesc')}
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => handleSave(textBoxName, textBoxDesc)} className={classes.button}>Save</Button>
            </DialogActions>
          </Dialog>
        </div>
        );
  }
}

export default withStyles(styles, {withTheme: true})(DialogItem);