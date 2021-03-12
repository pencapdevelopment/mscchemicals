import AssignmentIcon from "@material-ui/icons/Assignment";
import Avatar from "@material-ui/core/Avatar";
import React from "react";
import green from "@material-ui/core/colors/green";
import pink from "@material-ui/core/colors/pink";
import moment from 'moment/moment.js';
const styles = {
  pinkAvatar: {
    color: "#fff",
    backgroundColor: pink[500]
  },
  greenAvatar: {
    color: "#fff",
    backgroundColor: green[500]
  }
};

export default [
  {
    title: "Vestibulum Fusce Purus",
    stage: "Sale Enquiry",
    subtitle: moment().subtract(1, 'days').calendar(),
    avatar: <Avatar style={{ ...styles.pinkAvatar }}>H</Avatar>,
    body:
      "Nulla vitae elit libero, a pharetra augue. Curabitur blandit tempus porttitor. Fusce dapibus, tellus ac cursus commodo, "
  },
  {
    title: "Magna Consectetur Ipsum",
    stage: "Quotation",
    subtitle: new Date().toDateString(),
    avatar: (
      <Avatar style={{ ...styles.greenAvatar }}>
        <AssignmentIcon />
      </Avatar>
    ),
    body:
      "Maecenas faucibus mollis interdum. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus "
  },
  {
    title: "Parturient Justo Fringilla Nibh",
    stage: "Fallowup",
    subtitle: "Ullamcorper Parturient Ridiculus",
    avatar: (
      <Avatar
        alt=""
        src={`${process.env.PUBLIC_URL}/static/images/face1.jpg`}
      />
    ),
    body:
      "Maecenas faucibus mollis interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mollis, est non commodo luctus,"
  },
  {
    title: "Fermentum Pharetra",
    stage: "Negotiation",
    subtitle: "Fringilla Pellentesque Risus Tristique",
    avatar: (
      <Avatar
        alt=""
        src={`${process.env.PUBLIC_URL}/static/images/face2.jpg`}
      />
    ),
    body:
      "Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Etiam porta sem malesuada magna mollis euismod. "
  },
  {
    title: "Lorem Aenean Fermentum",
    stage: "Followup",
    subtitle: "Inceptos Vulputate",
    avatar: (
      <Avatar
        alt=""
        src={`${process.env.PUBLIC_URL}/static/images/face3.jpg`}
      />
    ),
    body:
      "Maecenas sed diam eget risus varius blandit sit amet non magna. Donec sed odio dui. Curabitur blandit tempus porttitor. "
  }
];
