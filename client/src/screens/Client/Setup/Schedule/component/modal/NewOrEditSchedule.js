import React, { useEffect, useState } from "react";

import {
  Button,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  makeStyles,
  Switch,
  TextField,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { KeyboardDatePicker, KeyboardTimePicker } from "@material-ui/pickers";
import moment from "moment";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";

// import useAuth from "../../../../../../hooks/useAuth";
import ScheduleService from "../../../../../../services/schedule.service";

const useStyles = makeStyles((theme) => ({
  gridMargin: {
    margin: "8px 0px",
  },
  noteMargin: {
    margin: "15px 0px",
  },
  title: {
    backgroundColor: theme.palette.primary.light,
    "& h2": {
      color: "#fff",
    },
  },
  content: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    fontSize: "18px",
  },
  formControl: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "20px",
    color: theme.palette.text.secondary,
    "& .MuiSelect-select": {
      minWidth: 120,
    },
  },
  switchFormControl: {
    marginBottom: "10px",
    display: "block",
  },
  root: {
    paddingLeft: "5px",
    "& .MuiTypography-root": {
      marginLeft: "5px",
    },
  },
  formHelperText: {
    width: "220px",
    fontSize: "12px",
    paddingLeft: "10px",
  },
  statusText: {
    width: "220px",
    fontSize: "14px",
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
  scheduleTitle: {
    fontWeight: "500",
    fontSize: 15,
    marginBottom: "20px",
  },
}));

const NewOrEditSchedule = ({
  isNewSchedule,
  isOpen,
  handleOnClose,
  userId,
  userList,
  handleChangeOfUserId,
  fetchScheduleSearch,
  ...props
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  // const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState([]);

  /* eslint-disable */
  useEffect(() => {
    const tempSchedule = {
      ...props.schedule,
    };
    setSchedule(tempSchedule);
  }, [props.schedule]);

  /* eslint-enable */

  useEffect(() => {
    if (moment(schedule.date_start) > moment()) {
      setStatus("Future");
    } else if (moment(schedule.date_end) < moment()) {
      setStatus("Past");
    } else {
      setStatus("Current");
    }
  }, [schedule]);

  const payload = {
    data: {
      user_id: schedule.user_id,
      date_start: schedule.date_start ? moment(schedule.date_start).format("YYYY-MM-DD") : null,
      date_end: schedule.date_end ? moment(schedule.date_end).format("YYYY-MM-DD") : null,
      time_start: schedule.time_start ? moment(schedule.time_start, "HH:mm:ss").format("HH:mm:ss") : null,
      time_end: schedule.time_end ? moment(schedule.time_end, "HH:mm:ss").format("HH:mm:ss") : null,
      active: schedule.active,
      note: schedule.note ? schedule.note : 0,
      monday: schedule?.monday ? 1 : 0,
      tuesday: schedule?.tuesday ? 1 : 0,
      wednesday: schedule?.wednesday ? 1 : 0,
      thursday: schedule?.thursday ? 1 : 0,
      friday: schedule?.friday ? 1 : 0,
    },
  };

  const handleCreateNewOrEditSchedule = () => {
    if (isNewSchedule) {
      ScheduleService.createNewSchedule(payload).then(
        (response) => {
          setTimeout(() => {
            enqueueSnackbar(`${response.data.message}`, {
              variant: "success",
            });
          }, 300);
        },
        (error) => {
          setTimeout(() => {
            setErrors(error.response.error);
          }, 300);
        },
      );
    } else {
      ScheduleService.updateSchedule(schedule.id, payload).then(
        (response) => {
          setTimeout(() => {
            enqueueSnackbar(`${response.data.message}`, {
              variant: "success",
            });
          }, 300);
        },
        (error) => {
          setTimeout(() => {
            setErrors(error.response.error);
          }, 300);
        },
      );
    }
    handleOnClose();
    setTimeout(() => {
      fetchScheduleSearch();
    }, 200);
  };

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      handleCreateNewOrEditSchedule();
    }
  };

  const getScheduleUserId = (selectedScheduleUserId, loggedInUser) => {
    if (isNewSchedule && !selectedScheduleUserId) {
      return loggedInUser?.id;
    }
    return selectedScheduleUserId;
  };

  return (
    <div>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={isOpen}
        onClose={handleOnClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={classes.title}>
          {isNewSchedule ? "New Schedule" : "Edit Schedule"}
        </DialogTitle>
        <DialogContent className={classes.content}>
          <DialogContentText id="alert-dialog-description">
            {isNewSchedule
              ? "This page is used to create a new schedule entry"
              : "This page is used to Edit existing schedule entry"}
          </DialogContentText>
          {errors
            && errors.map((error, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Alert severity="error" key={index}>
                {error.msg}
              </Alert>
            ))}
          <div className={classes.root}>
            <FormControl component="div" className={classes.formControl}>
              <Grid item xs={12} md={6} className={classes.gridMargin}>
                <TextField
                  fullWidth
                  autoFocus
                  required
                  id="user_id"
                  name="user_id"
                  select
                  label="User"
                  value={getScheduleUserId(schedule.user_id, userId)}
                  onChange={(e) => setSchedule({
                    ...schedule,
                    user_id: e.target.value,
                  })}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {userList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {`${u.firstname} ${u.lastname}`}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <p className={classes.formHelperText}>The name shown in the Appointment</p>
            </FormControl>
            <Grid container xs={12} md={12} className={classes.gridMargin}>
              <Grid item xs={12} sm={6} className={classes.gridMargin}>
                <p className={classes.scheduleTitle}>
                  Date and Time
                </p>
                <FormControl component="div" className={classes.formControl}>
                  <KeyboardDatePicker
                    required
                    clearable
                    autoOk
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    format="yyyy/MM/dd"
                    inputVariant="outlined"
                    variant="outlined"
                    id="dateStart"
                    label="Date Start"
                    className={classes.textField}
                    size="small"
                    name="date_start"
                    value={schedule.date_start}
                    onChange={(date) => setSchedule({
                      ...schedule,
                      date_start: date,
                    })}
                    onKeyUp={handleKeyUp}
                    maxDate={schedule.date_end}
                    maxDateMessage="Date start should not be after date end"
                  />
                </FormControl>
                <FormControl component="div" className={classes.formControl}>
                  <KeyboardDatePicker
                    required
                    clearable
                    autoOk
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    format="yyyy/MM/dd"
                    inputVariant="outlined"
                    variant="outlined"
                    id="dateEnd"
                    label="Date End"
                    className={classes.textField}
                    size="small"
                    name="date_end"
                    value={schedule.date_end}
                    onChange={(date) => setSchedule({
                      ...schedule,
                      date_end: date,
                    })}
                    onKeyUp={handleKeyUp}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    minDate={schedule.date_start}
                    minDateMessage="Date end should not be before date start"
                  />
                </FormControl>
                <FormControl component="div" className={classes.formControl}>
                  <KeyboardTimePicker
                    required
                    inputVariant="outlined"
                    KeyboardButtonProps={{
                      "aria-label": "change time",
                    }}
                    id="time_start"
                    name="time_start"
                    label="Time Start"
                    value={
                      schedule.time_start
                        ? moment(schedule.time_start, "HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss")
                        : null
                    }
                    className={classes.textField}
                    onChange={(date) => setSchedule({
                      ...schedule,
                      time_start: date,
                    })}
                    size="small"
                    autoOk
                    mask="__:__ _M"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    maxDate={schedule.time_end}
                    maxDateMessage="Time start should not be after time end"
                  />
                </FormControl>
                <FormControl component="div" className={classes.formControl}>
                  <KeyboardTimePicker
                    required
                    inputVariant="outlined"
                    KeyboardButtonProps={{
                      "aria-label": "change time",
                    }}
                    id="time_end"
                    name="time_end"
                    label="Time End"
                    value={
                      schedule.time_end
                        ? moment(schedule.time_end, "HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss")
                        : null
                    }
                    className={classes.textField}
                    onChange={(date) => setSchedule({
                      ...schedule,
                      time_end: date,
                    })}
                    size="small"
                    autoOk
                    mask="__:__ _M"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    minDate={schedule.time_start}
                    minDateMessage="Date end should not be before date start"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} className={classes.gridMargin}>
                <p className={classes.scheduleTitle}>
                  Week Plan
                </p>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={Boolean(schedule.monday)}
                      size="small"
                      name="active"
                      color="primary"
                      onChange={(e) => setSchedule({
                        ...schedule,
                        monday: e.target.checked,
                      })}
                      onKeyUp={handleKeyUp}
                    />
                  )}
                  label="Monday"
                  className={classes.switchFormControl}
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={Boolean(schedule.tuesday)}
                      size="small"
                      name="active"
                      color="primary"
                      onChange={(e) => setSchedule({
                        ...schedule,
                        tuesday: e.target.checked,
                      })}
                      onKeyUp={handleKeyUp}
                    />
                  )}
                  label="Tuesday"
                  className={classes.switchFormControl}
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={Boolean(schedule.wednesday)}
                      size="small"
                      name="active"
                      color="primary"
                      onChange={(e) => setSchedule({
                        ...schedule,
                        wednesday: e.target.checked,
                      })}
                      onKeyUp={handleKeyUp}
                    />
                  )}
                  label="Wednesday"
                  className={classes.switchFormControl}
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={Boolean(schedule.thursday)}
                      size="small"
                      name="active"
                      color="primary"
                      onChange={(e) => setSchedule({
                        ...schedule,
                        thursday: e.target.checked,
                      })}
                      onKeyUp={handleKeyUp}
                    />
                  )}
                  label="Thursday"
                  className={classes.switchFormControl}
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={Boolean(schedule.friday)}
                      size="small"
                      name="active"
                      color="primary"
                      onChange={(e) => setSchedule({
                        ...schedule,
                        friday: e.target.checked,
                      })}
                      onKeyUp={handleKeyUp}
                    />
                  )}
                  label="Friday"
                  className={classes.switchFormControl}
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={(
                <Switch
                  checked={Boolean(schedule.active)}
                  size="small"
                  name="active"
                  color="primary"
                  onChange={(e) => setSchedule({
                    ...schedule,
                    active: e.target.checked,
                  })}
                  onKeyUp={handleKeyUp}
                />
              )}
              label="Active / Inactive"
              className={classes.switchFormControl}
            />
            <p className={classes.statusText}>
              <span
                style={{
                  fontWeight: "500",
                }}
              >
                Status:
              </span>
              {" "}
              {status}
            </p>

            <FormControl component="div" className={classes.formControl}>
              <TextField
                className={classes.noteMargin}
                fullWidth
                variant="outlined"
                multiline
                name="note"
                label="Notes"
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  rows: 6,
                }}
                value={schedule.note}
                onChange={(e) => setSchedule({
                  ...schedule,
                  note: e.target.value,
                })}
                onKeyUp={handleKeyUp}
                error={String(schedule.note).length > 1000}
                helperText={String(schedule.note).length > 1000 && "Note can't be grater than 1000 Chars"}
              />
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions className={classes.modalAction}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleOnClose}
            style={{
              borderColor: colors.orange[600],
              color: colors.orange[600],
            }}
          >
            Cancel
          </Button>
          <Button variant="outlined" color="primary" size="small" onClick={handleCreateNewOrEditSchedule}>
            {isNewSchedule ? "Save" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

NewOrEditSchedule.propTypes = {
  userId: PropTypes.bool.isRequired,
  isNewSchedule: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  fetchScheduleSearch: PropTypes.func.isRequired,
  handleChangeOfUserId: PropTypes.func.isRequired,
  userList: PropTypes.arrayOf(
    PropTypes.arrayOf(),
  ).isRequired,
};

export default NewOrEditSchedule;
