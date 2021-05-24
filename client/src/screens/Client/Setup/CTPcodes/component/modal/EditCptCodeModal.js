import React from "react";

import {
  colors, FormControlLabel, FormGroup, Grid,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import PropTypes from "prop-types";
import NumberFormat from "react-number-format";

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
    color: theme.palette.text.secondary,
    "& .MuiSelect-select": {
      minWidth: 120,
    },
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
  modalAction: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    display: "flex",
    justifyContent: "space-between",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));


function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      prefix="$"
    />
  );
}
NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const EditCptCodeModal = ({
  isOpen,
  hendleOnClose,
  cpt_id,
  cpt_description,
  cpt_fee,
  cpt_favorite,
  cpt_billable,
  cpt_notes,
  handleChangeFee,
  handleChangeFavorite,
  handleChangeBillable,
  handleChangeNotes,
  handleEditCptCode,
}) => {
  const classes = useStyles();
  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      handleEditCptCode();
    }
  };

  return (
    <div>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={isOpen}
        onClose={hendleOnClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={classes.title}>
          Edit CPT Code
        </DialogTitle>
        <DialogContent className={classes.content}>
          <DialogContentText id="alert-dialog-description">
            This page is used to edit cpt code
          </DialogContentText>
          <div className={classes.root}>
            <FormControl component="div" className={classes.formControl}>
              <Grid item md={3} className={classes.gridMargin}>
                <TextField
                  fullWidth
                  label="CPT ID"
                  value={cpt_id}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled
                />
              </Grid>
              <p className={classes.formHelperText}>The name of the appointm</p>
            </FormControl>
            <FormControl component="div" className={classes.formControl}>
              <Grid item xs={6} md={9} className={classes.gridMargin}>
                <TextField
                  fullWidth
                  label="CPT Description"
                  value={cpt_description}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled
                />
              </Grid>
              <p className={classes.formHelperText}>
                The name shown in the Appointment
              </p>
            </FormControl>
            <FormControl component="div" className={classes.formControl}>
              <Grid item md={2} className={classes.gridMargin}>
                <TextField
                  fullWidth
                  autoFocus
                  label="Fee"
                  value={cpt_fee || ""}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    inputComponent: NumberFormatCustom,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleChangeFee}
                  onKeyUp={handleKeyUp}
                />
              </Grid>
              <p className={classes.formHelperText}>Edit fee here</p>
            </FormControl>
            <FormGroup>
              <FormControlLabel
                control={(
                  <Switch
                    checked={Boolean(cpt_favorite)}
                    color="primary"
                    size="small"
                    name="switchBox"
                    onChange={handleChangeFavorite}
                    onKeyUp={handleKeyUp}
                  />
                )}
                label="Favorite"
                className={classes.root}
              />
              <FormControlLabel
                control={(
                  <Switch
                    checked={Boolean(cpt_billable)}
                    size="small"
                    color="primary"
                    name="switchBox"
                    onChange={handleChangeBillable}
                    onKeyUp={handleKeyUp}
                  />
                )}
                label="Billable"
                className={classes.root}
              />
            </FormGroup>
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
                  rows: 8,
                }}
                value={cpt_notes}
                onChange={handleChangeNotes}
                onKeyUp={handleKeyUp}
              />
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions className={classes.modalAction}>
          <Button
            size="small"
            variant="outlined"
            onClick={hendleOnClose}
            style={{
              borderColor: colors.orange[600],
              color: colors.orange[600],
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleEditCptCode}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

EditCptCodeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  hendleOnClose: PropTypes.func.isRequired,
  cpt_id: PropTypes.string.isRequired,
  cpt_description: PropTypes.string.isRequired,
  cpt_fee: PropTypes.string.isRequired,
  cpt_favorite: PropTypes.string.isRequired,
  cpt_billable: PropTypes.string.isRequired,
  cpt_notes: PropTypes.string.isRequired,
  handleChangeFee: PropTypes.func.isRequired,
  handleChangeFavorite: PropTypes.func.isRequired,
  handleChangeBillable: PropTypes.func.isRequired,
  handleChangeNotes: PropTypes.func.isRequired,
  handleEditCptCode: PropTypes.func.isRequired,
};
export default EditCptCodeModal;
