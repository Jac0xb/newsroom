import * as React from 'react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Link } from '@material-ui/icons';
import { styles } from './styles';
import classNames from 'classnames';

export namespace DetailLine {
	export interface Props {
		classes?: any,
		title: string,
		link?: string,
		data: string,
	}
}

class DetailLine extends React.Component<DetailLine.Props> {
	render() {

		const {classes, title, data, link} = this.props

		return (
			<React.Fragment>
				<Typography className={classNames(classes.detailLine, classes.noWrap)}> 
					<span className={classes.noWrap} style={{fontWeight: "bold"}}>{title}:</span>
				</Typography>

				<Typography className={classes.detailLine}> 
					{(link) &&
					<a className={classes.detailLine} href={link}>
						<span className={classNames(classes.noWrap, classes.flexGrow)}>&nbsp;{data}</span>
						<Link className={classes.linkIcon}/>
					</a>
					}
					{(!link) &&
						<span>&nbsp;{data}</span>
					}
				</Typography>
			</React.Fragment>
		);
	}
}

export default withStyles(styles, {withTheme: true})(DetailLine);
