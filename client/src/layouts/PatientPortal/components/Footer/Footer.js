import React from "react";

import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import useAuth from "../../../../hooks/useAuth";


const useStyles = makeStyles((theme) => ({
  footer: {
    clear: "both",
    position: "relative",
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(5),
  },
}));

const CustomTypography = withStyles((theme) => ({
  root: {
    fontSize: "11px",
    lineHeight: "4px",
    letterSpacing: ".65px",
    color: theme.palette.secondary.main,
  },
}))(Typography);

export default function Footer() {
  const classes = useStyles();
  const { user } = useAuth();
  return (
    <Container component="footer" maxWidth={false} className={classes.footer}>
      <Box pt={2} pb={2}>
        <CustomTypography variant="body2" color="textPrimary" align="center">
          {"Copyright © "}
          {" "}
          {new Date().getFullYear()}
          {` AvonEMR - User ${user.firstname} ${user.lastname}`}
        </CustomTypography>
      </Box>
    </Container>
  );
}
