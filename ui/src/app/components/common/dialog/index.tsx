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
        handleTextBoxesChange: Function
        handleSave: Function
        handleClose: Function
        textBoxName: string
        textBoxDesc: string
    }
    export interface State {
        // textBoxName: string
        // textBoxDesc: string
        open: boolean
    }
}
class DialogItem extends React.Component<DialogItem.Props, DialogItem.State, any> {

  constructor(props: DialogItem.Props) {
      super(props)
      this.state = {
        // textBoxName: "",
        // textBoxDesc: "",
        open: false,
      }
  }
  
  // handleTextBoxesChange = (name: keyof DialogItem.State) => (event: React.ChangeEvent<HTMLInputElement>) => {

  //   if(name == "textBoxName"){
  //       this.setState({ textBoxName: event.target.value });
  //   }
  //   if(name == "textBoxDesc"){
  //       this.setState({ textBoxDesc: event.target.value });
  //   }
  // };
  
  handleOpen(open: boolean) {
    this.setState({ open: open });
  };

  render() {

        const {classes, textBoxName, textBoxDesc, title, desc, show, handleTextBoxesChange, handleSave, handleClose} = this.props;
        //const {textBoxName, textBoxDesc} = this.state;

        return (
        <div className={classes.item}>
            <Dialog className={classes.dialog}
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
                  onChange={handleTextBoxesChange('textBoxName')}
                />
                <TextField
                  id="stage-desc"
                  label="Description"
                  className={classes.textField}
                  value={textBoxDesc}
                  onChange={handleTextBoxesChange('textBoxDesc')}
                />
              </form>
            </DialogContent>
            <DialogActions>
				<Button variant="contained" onClick={() => handleClose(false)} className={classes.button}>Cancel</Button>
              	<Button variant="contained" onClick={() => handleSave(textBoxName, textBoxDesc)} className={classes.button}>Save</Button>
            </DialogActions>
          </Dialog>
        </div>
        );
  }
}

export default withStyles(styles, {withTheme: true})(DialogItem);