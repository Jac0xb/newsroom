import * as React from 'react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Link } from '@material-ui/icons';
import { styles } from './styles';

export namespace DetailLine {
	export interface Props {
		classes?: any,
		title: string,
		link?: boolean
		data: string,
	}
}

class DetailLine extends React.Component<DetailLine.Props> {
	render() {

		const {classes, title, data, link} = this.props

		return (
			<tr>
			<td>
				<Typography className={classes.detailLine} variant={"subtitle1"}> 
					<span style={{fontWeight: "bold"}}>{title}:</span>
				</Typography>
			</td>
			<td>
				<Typography className={classes.detailLine} variant={"subtitle1"}> 
					{(link) &&
					<a className={classes.detailLine} href="/users/jacobbrown">
						&nbsp;{data}
						<Link className={classes.linkIcon}/>
					</a>
					}
					{(!link) &&
						<span>&nbsp;{data}</span>
					}
				</Typography>
			</td>
			</tr>
		);
	}
}

export default withStyles(styles, {withTheme: true})(DetailLine);
