import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PrimarySearchAppBar from 'app/components/Common/appbar';
import DocumentDetails from 'app/components/Document/DocumentDetails';

export namespace Document {
	export interface Props extends RouteComponentProps<void> {
  }
}

export class DocumentContainer extends React.Component<Document.Props> {
	
	static defaultProps: Partial<Document.Props> = {
	};

	constructor(props: Document.Props, context?: any) {
		super(props, context);
	}

  	render() {
		return (
			<React.Fragment>
				<PrimarySearchAppBar/>
				<DocumentDetails/>
			</React.Fragment>
		);
	}
}
