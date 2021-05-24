import React, { useEffect, useState } from "react";

import {
  Button, makeStyles, TextField,
} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";

import MessagesService from "../../../../services/patient_portal/messages.service";

const useStyles = makeStyles((theme) => ({
  modalTitle: {
    backgroundColor: theme.palette.primary.light,
    "& h2": {
      color: "#fff",
      fontSize: "16px",
    },
  },
  modalContent: {
    paddingLeft: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(6),
    fontSize: "18px",
    "& p": {
      fontSize: "16px",
    },
  },
  modalAction: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    display: "flex",
    justifyContent: "space-between",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  gutterBottom: {
    marginBottom: theme.spacing(2),
  },
  w100: {
    minWidth: 100,
  },
}));

const MessageModal = (props) => {
  const {
    isOpen, onClose, selectedMessage, title, reloadData,
  } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const fetchUsers = () => {
    MessagesService.getMessageUsers().then((res) => {
      setUsers(res.data.data);
    });
  };

  useEffect(() => {
    fetchUsers();
    if (selectedMessage) {
      setSubject(selectedMessage.subject);
      setMessage(selectedMessage.message);
      setSelectedUser(selectedMessage.user_id_to);
    }
  }, [selectedMessage]);

  const handleClose = () => {
    onClose();
  };

  const handleMessageSubmission = () => {
    const formData = {
      data: {
        user_id_to: selectedUser,
        subject,
        message,
      },
    };
    MessagesService.createMessage(formData).then((response) => {
      enqueueSnackbar(`${response.data.message}`, {
        variant: "success",
      });
      reloadData();
      handleClose();
    });
  };

  const handleMessageUpdate = () => {
    const formData = {
      data: {
        id: selectedMessage.id,
        user_id_to: selectedUser,
        subject,
        message,
      },
    };
    MessagesService.updateMessage(formData).then((response) => {
      enqueueSnackbar(`${response.data.message}`, {
        variant: "success",
      });
      reloadData();
      handleClose();
    });
  };

  return (
    <Dialog
      maxWidth="sm"
      open={isOpen}
      onClose={handleClose}
    >
      <DialogTitle className={classes.modalTitle}>
        {title}
      </DialogTitle>
      <DialogContent className={classes.modalContent} style={{ minWidth: "600px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <FormControl
            variant="outlined"
            className={classes.customSelect}
            size="small"
          >
            <InputLabel htmlFor="age-native-simple">To</InputLabel>
            <Select
              native
              value={selectedUser}
              onChange={(event) => setSelectedUser(event.target.value)}
              inputProps={{
                name: "type",
                id: "age-native-simple",
              }}
              label="To"
              className={classes.gutterBottom}
            >
              <option aria-label="None" value="" />
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {`${user.firstname} ${user.lastname}`}
                </option>
              ))}
            </Select>
          </FormControl>
          {/* Commented out as per CLIN-114 */}
          {/* <TextField
            fullWidth
            margin="normal"
            variant="outlined"
            label="Subject"
            size="small"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className={classes.gutterBottom}
          /> */}
          <TextField
            variant="outlined"
            name="notes"
            id="notes"
            type="text"
            label="Message"
            required
            fullWidth
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            multiline
            rows={5}
          />
        </div>
      </DialogContent>
      <DialogActions className={classes.modalAction}>
        <Button
          variant="outlined"
          className={classes.w100}
          onClick={handleClose}
        >
          Cancel
        </Button>
        {
          selectedMessage
            ? (
              <Button
                variant="outlined"
                color="primary"
                className={classes.w100}
                onClick={() => handleMessageUpdate()}
              >
                Update
              </Button>
            )
            : (
              <Button
                variant="outlined"
                color="primary"
                className={classes.w100}
                onClick={() => handleMessageSubmission()}
              >
                Send
              </Button>
            )
        }
      </DialogActions>
    </Dialog>
  );
};

MessageModal.defaultProps = {
  selectedMessage: null,
};

MessageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reloadData: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  selectedMessage: PropTypes.shape({
    id: PropTypes.number.isRequired,
    user_id_to: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }),
};

export default MessageModal;
