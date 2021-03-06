import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  stream: {
    padding: theme.spacing(1),
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '44px',
      bottom: 0,
      [theme.breakpoints.down('sm')]: {
        left: '44px'
      },
      [theme.breakpoints.up('sm')]: {
        left: '43px'
      },
      width: '1px',
      backgroundColor: theme.palette.divider
    }
  },
  card: {
    backgroundColor: 'transparent',
    boxShadow: 'none'
  },
  content: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: '74px'
    },
    [theme.breakpoints.up('sm')]: {
      paddingLeft: '80px'
    }
  }
}));

const ActivityStream = ({ title, stream }) => {
  const classes = useStyles();
  return (
    <div className={classes.stream} style={{marginTop: -16}}>
      <div className={classes.card}>
      <Button  className="mt-2" style={{marginLeft: 35,  backgroundColor:"yellow"}}  size="small"><span style={{  textTransform: 'none', fontWeight: 'normal', }}> {title}</span></Button>
                                                          
        {/* <Button  style={{textTransform: 'none',fontWeight: 'normal'}} variant="contained" color="">
          {title}
        </Button> */}
      </div>

      {stream.map((item, index) => (
        <Card key={index} >
          <CardHeader
          
            avatar={item.avatar}
            title={item.title}
            subheader={item.subtitle}
            style={{fontSize: 18, fontWeight: 'normal'}}
          />
          <CardContent   className={classes.content}>
            <Typography  style={{fontSize: 12, fontWeight: 'normal'}}component="p">{item.body}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

ActivityStream.propTypes = {
  title: PropTypes.string.isRequired,
  stream: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      avatar: PropTypes.element,
      body: PropTypes.string
    })
  ).isRequired
};

export default ActivityStream;
