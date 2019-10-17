import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Paper, Typography, Divider, Grid, Menu, MenuItem, IconButton } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { DocumentTileComponent } from 'app/views/dashboard/components/DocumentTile';
import axios from 'axios';
import MaterialTable from 'material-table';
import { NRDocument } from 'app/utils/models';

export namespace WorkflowStage {
    export interface Props {
        classes?: any 
        id: number
        name: string
        desc: string
        onEditClick: Function
        onDeleteClick: Function
        canEdit: boolean
        show: number
        index: number
    }
    export interface State {
      openMenu: boolean
      stageDocuments: Array<NRDocument>
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
    var stageDocuments: Array<NRDocument> = []

		axios.get("/api/documents/stage/" + this.props.id).then((response) => {
      console.log(response.data)
      // var documents: Array<NRDocument>[] = response.data

      // Get all documents for this stage
    //   documents.forEach(document => {
    //     if(document.stage != null){
    //       if(document.stage.id == this.props.id){
    //         stageDocuments.push(document)
    //       }
    //     }
    //   });
      
		// 	this.setState({ stageDocuments })
		});
  }
  
  handleMenuClick = (event: any) => {
    this.setState({openMenu: !this.state.openMenu, anchorEl: event.currentTarget})
  }
  
  handleMenuClose = () => {
    this.setState({ openMenu: false, anchorEl: null });
  }

  render() {

    const { classes, show, index } = this.props;
    const { openMenu, stageDocuments } = this.state;

    // Get most up-to-date documents list
    // this.getDocuments();

    const docList = stageDocuments.map((document, i) =>
			<DocumentTileComponent key={i} document={document} compressed={true} onDelete={() => {}} />
    );

    return (
      <main className={classes.layout}>
        {
          show == index ? 
            <MaterialTable
              columns={[
                  {title: "Aricle", field: "name"},
                  {title: "Assinged", field: "assinged"},
                  {title: "Due", field: "due"},
                  // {title: "", render: (user: NRUser) => this.deleteUser.bind(this)(user)}
              ]}
              data={docList}
              title="Documents"/>
          : null
        }
        {/* {
          show == index ? 
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
              <Grid className={classes.documentGrid} container>
                {docList}
              </Grid>
            </Paper>
          : null
        } */}
        
      </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowStage);