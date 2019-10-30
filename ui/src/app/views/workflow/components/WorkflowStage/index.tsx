import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import {  } from '@material-ui/core';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MaterialTable from 'material-table';
import { NRDocument } from 'app/utils/models';

export namespace WorkflowStage {
    export interface Props {
        classes?: any 
        id: number
        name: string
        desc: string
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

		axios.get("/api/documents/stage/" + this.props.id).then((response) => {
			this.setState({ stageDocuments: response.data })
		});
  }
  
  handleMenuClick = (event: any) => {
    this.setState({openMenu: !this.state.openMenu, anchorEl: event.currentTarget})
  }
  
  handleMenuClose = () => {
    this.setState({ openMenu: false, anchorEl: null });
  }

  static getStageDocs(doc: NRDocument) {
    return (
      <Link style={{ textDecoration: "none" }} to={`/document/${doc.id}/edit`}>
        {doc.name}
      </Link>
    )
}

  render() {

    const { classes, show, index } = this.props;
    const { stageDocuments } = this.state;

    return (
      <main className={classes.layout}>
        {
          show == index ? 
            <MaterialTable
              title="Documents"
              columns={[
                  {title: "Aricle", render: WorkflowStage.getStageDocs},
                  {title: "Assinged", field: "assinged"},
                  {title: "Due", field: "due"},
              ]}
              data={stageDocuments}
              />
          : null
        }
      </main>
    );
  }
}

export default withStyles(styles, {withTheme: true})(WorkflowStage);