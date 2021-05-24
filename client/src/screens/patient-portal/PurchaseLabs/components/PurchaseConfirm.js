import React from "react";

import { Button, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => createStyles({
  titleContainer: {
    minHeight: 50,
    backgroundColor: theme.palette.primary.main,
    "& h5": {
      color: theme.palette.common.white,
    },
  },
  content: {
    padding: "2rem 1.5rem",
    "& p": {
      lineHeight: "20px",
      fontSize: "16px",
    },
  },
  actionsContainer: {
    padding: "1rem 1.5rem",
    justifyContent: "flex-end",
    borderColor: theme.palette.borderColor,
    borderTop: "1px solid",
  },
  w100: {
    minWidth: 100,
  },
  boldPrice: {
    fontWeight: "bold",
    padding: theme.spacing(0, 0.5),
  },
}));

const PurchaseConfirm = ({
  open,
  onClose,
  amount,
}) => {
  const classes = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle disableTypography className={classes.titleContainer} id="form-dialog-title">
        <Typography variant="h5">Purchase success</Typography>
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="body1" gutterBottom>
          This is a confirmation that you have purchased lab(s) for
          <span className={classes.boldPrice}>
            $
            {amount}
          </span>
        </Typography>
        <Typography variant="body1" gutterBottom>
          Next step is to
          {" "}
          <Link to="/patient/labs-requisition">click here</Link>
          {" "}
          to print your lab requisition.
        </Typography>
      </DialogContent>
      <DialogActions classes={{ root: classes.actionsContainer }}>
        <Button
          className={classes.w100}
          onClick={onClose}
          type="submit"
          variant="outlined"
          color="primary"
          disableElevation
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PurchaseConfirm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  amount: PropTypes.number.isRequired,
};

export default PurchaseConfirm;
