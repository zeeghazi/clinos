import React from "react";

import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  makeStyles,
  TextField,
} from "@material-ui/core";
import Proptypes from "prop-types";


const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: "100%",
  },
  controlLabel: {
    marginLeft: "0px",
    marginRight: "15px",
  },
  input: {
    padding: "10.5px",
  },
  formStyle: {
    display: "flex",
  },
  gridMargin: {
    marginRight: "10px",
    marginBottom: "8px",
  },
  submit: {
    paddingLeft: "30px",
    paddingRight: "30px",
    // fontSize: "1rem",
    marginTop: "8px",
  },
}));

const CPTform = ({
  labCompanyId,
  lebCompanyList,
  fetchCptCodeSearch,
  handleChangeOfCptId,
  handleChangeOfCptDescription,
  handleChangeOfLabCompanyId,
  handleChangeOfFavorite,
  handleChangeOfBillable,
  handleChangeOfSelf,
  handleChangeOfGroup,
}) => {
  const classes = useStyles();

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      fetchCptCodeSearch();
    }
  };

  return (
    <div style={{ marginTop: "15px" }}>
      <Grid className={classes.formStyle}>
        <Grid item xs={12} md={1} className={classes.gridMargin}>
          <TextField
            fullWidth
            autoFocus
            label="CPT ID"
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={handleChangeOfCptId}
            onKeyUp={handleKeyUp}
          />
        </Grid>
        <Grid item xs={12} md={3} className={classes.gridMargin}>
          <TextField
            fullWidth
            label="CPT Description"
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={handleChangeOfCptDescription}
            onKeyUp={handleKeyUp}
          />
        </Grid>
        <Grid item xs={12} md={2} className={classes.gridMargin}>
          <TextField
            fullWidth
            id="outlined-select-currency"
            select
            label="Lab Company"
            value={labCompanyId}
            onChange={handleChangeOfLabCompanyId}
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            SelectProps={{
              native: true,
            }}
          >
            <option aria-label="None" value="" />
            {lebCompanyList.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <FormControlLabel
        control={(
          <Checkbox
            name="favorite"
            onChange={handleChangeOfFavorite}
            onKeyUp={handleKeyUp}
            color="primary"
            size="small"
          />
        )}
        label="Favorites"
        labelPlacement="start"
        className={classes.controlLabel}
      />
      <FormControlLabel
        control={(
          <Checkbox
            onChange={handleChangeOfBillable}
            onKeyUp={handleKeyUp}
            name="billable"
            color="primary"
            size="small"
          />
        )}
        label="Billable"
        labelPlacement="start"
        className={classes.controlLabel}
      />
      <FormControlLabel
        control={(
          <Checkbox
            onChange={handleChangeOfSelf}
            onKeyUp={handleKeyUp}
            name="self"
            color="primary"
            size="small"
          />
        )}
        label="Self"
        labelPlacement="start"
        className={classes.controlLabel}
      />
      <FormControlLabel
        control={(
          <Checkbox
            onChange={handleChangeOfGroup}
            onKeyUp={handleKeyUp}
            name="group"
            color="primary"
            size="small"
          />
        )}
        label="Group"
        labelPlacement="start"
        className={classes.controlLabel}
      />
      <br />
      <Button
        size="medium"
        type="submit"
        variant="contained"
        color="primary"
        className={classes.submit}
        onClick={fetchCptCodeSearch}
      >
        Search
      </Button>
    </div>
  );
};

CPTform.propTypes = {
  labCompanyId: Proptypes.string.isRequired,
  lebCompanyList: Proptypes.arrayOf(
    Proptypes.shape({
      id: Proptypes.string,
      name: Proptypes.string,
    }),
  ).isRequired,
  fetchCptCodeSearch: Proptypes.func.isRequired,
  handleChangeOfCptId: Proptypes.func.isRequired,
  handleChangeOfCptDescription: Proptypes.func.isRequired,
  handleChangeOfLabCompanyId: Proptypes.func.isRequired,
  handleChangeOfFavorite: Proptypes.func.isRequired,
  handleChangeOfBillable: Proptypes.func.isRequired,
  handleChangeOfSelf: Proptypes.func.isRequired,
  handleChangeOfGroup: Proptypes.func.isRequired,
};

export default CPTform;
