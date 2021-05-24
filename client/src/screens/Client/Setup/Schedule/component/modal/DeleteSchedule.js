import React from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  makeStyles,
} from "@material-ui/core/styles";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";

import ScheduleService from "../../../../../../services/schedule.service";


const useStyles = makeStyles((theme) => ({
  title: {
    backgroundColor: theme.palette.error.light,
    "& h2": {
      color: "#fff",
    },
  },
  content: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    fontSize: "18px",
  },
  modalAction: {
    borderTop: `1px solid ${theme.palette.background.default}`,
  },
}));

const DeleteSchedule = ({
  id, isDeleteModalOpen, onClose, fetchScheduleSearch,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteSchedule = () => {
    ScheduleService.deleteSchedule(id).then((res) => {
      setTimeout(() => {
        enqueueSnackbar(`${res.data.message}`, {
          variant: "success",
        });
      }, 300);
    });
    onClose();
    setTimeout(() => {
      fetchScheduleSearch();
    }, 200);
  };
  return (
    <div>
      <Dialog
        open={isDeleteModalOpen}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={classes.title}>
          Are you sure about deleting this schedule entry?
        </DialogTitle>
        <DialogContent className={classes.content}>
          <DialogContentText id="alert-dialog-description">
            Your this schedule entry will be deleted forever from our system and you won&apos;t be able to
            access it anymore.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.modalAction}>
          <Button onClick={() => onClose("no")} color="primary">
            No
          </Button>
          <Button onClick={handleDeleteSchedule} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

DeleteSchedule.propTypes = {
  id: PropTypes.string.isRequired,
  isDeleteModalOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchScheduleSearch: PropTypes.func.isRequired,
};

export default DeleteSchedule;
