import React, { useState, useEffect, useCallback } from "react";

import {
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";

import Tooltip from "../../../components/common/CustomTooltip";
import { StyledTableRowSm, StyledTableCellSm } from "../../../components/common/StyledTable";
import useDidMountEffect from "../../../hooks/useDidMountEffect";
import usePatientContext from "../../../hooks/usePatientContext";
import { toggleRequisitionDialog } from "../../../providers/Patient/actions";
import CPTCodesService from "../../../services/cpt.service";
import PatientService from "../../../services/patient.service";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down("md")]: {
      padding: 0,
    },
  },
  tableContainer: {
    marginTop: theme.spacing(1),
  },
  header: {
    minHeight: 38,
    display: "flex",
    alignItems: "flex-end",
  },
  pointer: {
    cursor: "pointer",
  },
  actionContainer: {
    marginTop: theme.spacing(2),
  },
  menuOption: {
    minHeight: 26,
  },
}));

const Requisitions = (props) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { state, dispatch } = usePatientContext();
  const { reloadData } = props;
  const [searchText, setSearchText] = useState("");
  const [hasUserSearched, setHasUserSearched] = useState(false);
  const [tests, setTests] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [favoriteTests, setFavoriteTests] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [labCompanyList, setLabCompanyList] = useState([]);

  const { patientId } = state;

  const searchTests = (e, text) => {
    e.preventDefault();
    const reqBody = {
      data: {
        text,
        company_id: selectedCompany.length ? selectedCompany : undefined,
      },
    };
    PatientService.searchTests(patientId, reqBody).then((res) => {
      setTests(res.data);
      setHasUserSearched(true);
    });
  };

  const fetchLabCompanyList = useCallback(() => {
    CPTCodesService.getLabCompnayList().then((res) => {
      const companyList = res.data;
      const emptyOption = {
        name: "",
        id: "",
      };
      setLabCompanyList([emptyOption, ...companyList]);
    });
  }, []);

  const fetchRecentTests = useCallback(() => {
    PatientService.getRequisitionsRecentTests(patientId).then((response) => {
      setRecentTests(response.data);
    });
  }, [patientId]);

  const fetchFavoriteTests = useCallback(() => {
    PatientService.getRequisitionsFavoriteTests(patientId).then((response) => {
      setFavoriteTests(response.data);
    });
  }, [patientId]);

  useEffect(() => {
    fetchLabCompanyList();
    fetchRecentTests();
    fetchFavoriteTests();
  }, [fetchLabCompanyList, fetchRecentTests, fetchFavoriteTests]);

  const onFormSubmit = (selectedTest) => {
    const reqBody = {
      data: {
        marker_id: selectedTest.marker_id,
      },
    };
    PatientService.createRequisition(patientId, reqBody)
      .then((response) => {
        enqueueSnackbar(`${response.data.message}`, { variant: "success" });
        reloadData();
        dispatch(toggleRequisitionDialog());
      });
  };

  useDidMountEffect(() => {
    if (!searchText.length) {
      setTests([]);
      setHasUserSearched(false);
    }
  }, [searchText]);

  return (
    <>
      <Grid container spacing={4}>
        <Grid item md={4} xs={12}>
          <Grid item sm={9}>
            <TextField
              select
              required
              variant="outlined"
              label="Lab Company"
              margin="dense"
              fullWidth
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(`${e.target.value}`)} // number to string
            >
              {labCompanyList.map((option) => (
                <MenuItem key={option.id} value={option.id} className={classes.menuOption}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item md={4} xs={12}>
          <form onSubmit={(e) => searchTests(e, searchText)}>
            <Grid container spacing={2} alignItems="center">
              <Grid item sm={9} xs={8}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  type="submit"
                  fullWidth
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
          <TableContainer className={classes.tableContainer}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCellSm>Name</StyledTableCellSm>
                  <StyledTableCellSm width="15%">Favorite</StyledTableCellSm>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests.length
                  ? tests.map((item) => (
                    <StyledTableRowSm
                      key={item.marker_id}
                      className={classes.pointer}
                      onClick={() => onFormSubmit(item)}
                    >
                      {!!item.name && item.name.length > 30
                        ? (
                          <Tooltip title={item.name}>
                            <StyledTableCellSm
                              className={classes.overFlowControl}
                            >
                              {item.name}
                            </StyledTableCellSm>
                          </Tooltip>
                        )
                        : <StyledTableCellSm>{item.name}</StyledTableCellSm>}
                      <StyledTableCellSm>{item.favorite ? "Yes" : ""}</StyledTableCellSm>
                    </StyledTableRowSm>
                  ))
                  : hasUserSearched ? (
                    <StyledTableRowSm>
                      <StyledTableCellSm colSpan={4}>
                        <Typography align="center" variant="body1" className={classes.text}>
                          No Records found...
                        </Typography>
                      </StyledTableCellSm>
                    </StyledTableRowSm>
                  ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item md={4} xs={12}>
          <Grid className={classes.section}>
            <Grid className={classes.header}>
              <Typography variant="h5" color="textPrimary">
                Recently Used
              </Typography>
            </Grid>
            <TableContainer className={classes.tableContainer}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCellSm>Name</StyledTableCellSm>
                    <StyledTableCellSm width="15%">Favorite</StyledTableCellSm>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTests.length
                    ? recentTests.map((item) => (
                      <StyledTableRowSm
                        key={item.marker_id}
                        className={classes.pointer}
                        onClick={() => onFormSubmit(item)}
                      >
                        {!!item.name && item.name.length > 30
                          ? (
                            <Tooltip title={item.name}>
                              <StyledTableCellSm
                                className={classes.overFlowControl}
                              >
                                {item.name}
                              </StyledTableCellSm>
                            </Tooltip>
                          )
                          : <StyledTableCellSm>{item.name}</StyledTableCellSm>}
                        <StyledTableCellSm>{item.favorite ? "Yes" : ""}</StyledTableCellSm>
                      </StyledTableRowSm>
                    ))
                    : (
                      <StyledTableRowSm>
                        <StyledTableCellSm colSpan={4}>
                          <Typography align="center" variant="body1" className={classes.text}>
                            No Records found...
                          </Typography>
                        </StyledTableCellSm>
                      </StyledTableRowSm>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        <Grid item md={4} xs={12}>
          <Grid className={classes.section}>
            <Grid className={classes.header}>
              <Typography variant="h5" color="textPrimary">
                Favorites
              </Typography>
            </Grid>
            <TableContainer className={classes.tableContainer}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCellSm>Name</StyledTableCellSm>
                    <StyledTableCellSm width="15%">Favorite</StyledTableCellSm>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {favoriteTests.length
                    ? favoriteTests.map((item) => (
                      <StyledTableRowSm
                        key={item.marker_id}
                        className={classes.pointer}
                        onClick={() => onFormSubmit(item)}
                      >
                        {!!item.name && item.name.length > 30
                          ? (
                            <Tooltip title={item.name}>
                              <StyledTableCellSm
                                className={classes.overFlowControl}
                              >
                                {item.name}
                              </StyledTableCellSm>
                            </Tooltip>
                          )
                          : <StyledTableCellSm>{item.name}</StyledTableCellSm>}
                        <StyledTableCellSm>{item.favorite ? "Yes" : ""}</StyledTableCellSm>
                      </StyledTableRowSm>
                    ))
                    : (
                      <StyledTableRowSm>
                        <StyledTableCellSm colSpan={4}>
                          <Typography align="center" variant="body1" className={classes.text}>
                            No Records found...
                          </Typography>
                        </StyledTableCellSm>
                      </StyledTableRowSm>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

Requisitions.propTypes = {
  reloadData: PropTypes.func.isRequired,
};

export default Requisitions;
