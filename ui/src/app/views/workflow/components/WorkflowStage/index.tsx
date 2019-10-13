import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Paper, Typography, Divider, Grid, Menu, MenuItem, IconButton } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { DocumentTileComponent } from 'app/views/dashboard/components/DocumentTile';
import axios from 'axios';

export namespace WorkflowStage {
    export interface Props {
        classes?: any 
        id: number
        name: string
        desc: string
        onEditClick: Function
        onDeleteClick: Function
        canEdit: boolean
    }
    export interface State {
      openMenu: boolean
      stageDocuments: any[]
      anchorEl?: any
    }
}
class WorkflowStage extends React.Component<WorkflowStage.Props, WorkflowStage.State, any> {

  constructor(props: WorkflowStage.Props) {
      super(props)
      this.state = {
        openMenu: false,
        stageDocuments: [],
        anchorEl: null,
      }
  }

  componentDidMount() {
    this.getDocuments();
  }

  // Get documents for this stage from database
  getDocuments() {
    const stageDocuments: any[] = [] 

		axios.get("/api/documents/").then((response) => {

      const documents: any[] = response.data

      // Get all documents for this stage
      documents.forEach(document => {
        if(document.stage != null){
          if(document.stage.id == this.props.id){
            stageDocuments.push(document)
          }
        }
      });
      
			this.setState({ stageDocuments })
		});
  }
  
  handleMenuClick = (event: any) => {
    this.setState({openMenu: !this.state.openMenu, anchorEl: event.currentTarget})
  }
  
  handleMenuClose = () => {
    this.setState({ openMenu: false, anchorEl: null });
  }

  render() {

    const { classes } = this.props;
    const { openMenu, stageDocuments } = this.state;

    // Get most up-to-date documents list
    this.getDocuments();

    const docList = stageDocuments.map((document, i) =>
			<DocumentTileComponent key={i} document={document} compressed={true} onDelete={() => {}} />
    );

    return (
      <main className={classes.layout}>
        <Paper className={classes.stage} key={this.props.id}>
          <div className={classes.headingDiv}>
              <Typography className={classes.heading}>
                {this.props.name}
              </Typography>
              { this.props.canEdit ? 
                <div>
                  <IconButton
                    onClick={(event) => this.handleMenuClick(event)}
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                  >
                    <MoreVertIcon />
                  </IconButton>
                    <Menu
                      id="long-menu"
                      anchorEl={this.state.anchorEl}
                      open={openMenu}
                      onClose={() => this.handleMenuClose()}
                      PaperProps={{
                        style: {
                          maxHeight: 216,
                          width: 200,
                        },
                      }}
                    >
                      <MenuItem key={0} onClick={() => {this.props.onEditClick(this.props.id); this.setState({openMenu: false})}}>
                        Edit
                      </MenuItem>
                      <MenuItem key={1} onClick={() => {this.props.onDeleteClick(this.props.id); this.setState({openMenu: false})}}>
                        Delete
                      </MenuItem>
                    </Menu>
                </div>
                : null
              }
          </div>

          <Divider style={{marginBottom: "8px"}}/>
          <Typography component="p">
            {(this.props.desc) === "" ? "(No Description)" : this.props.desc}
          </Typography>
          <Grid className={classes.documentGrid} container spacing={4}>
            {docList}
          </Grid>
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowStage);