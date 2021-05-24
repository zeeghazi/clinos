import React from "react";

import { makeStyles, withStyles, colors } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import moment from "moment";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    padding: theme.spacing(2, 4, 3),
  },
  modalAction: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    display: "flex",
    justifyContent: "space-between",
  },
}));

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.grey,
    color: theme.palette.grey,
    fontSize: "12px",
    fontWeight: 700,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    fontSize: 14,
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "& th": {
      fontSize: 12,
      whiteSpace: "nowrap",
    },
    "& td": {
      fontSize: 12,
      whiteSpace: "nowrap",
    },
  },
}))(TableRow);


export default function ConfigModal({ modal, setModal }) {
  const classes = useStyles();

  return (
    <Dialog
      open={modal.isOpen}
      onClose={() => setModal({ ...modal, isOpen: false })}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="lg"
    >
      <div className={classes.paper}>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            color="textPrimary"
            className={classes.title}
          >
            Configuration History
          </Typography>
          <div>
            <DialogActions className={classes.modalAction}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setModal({ ...modal, isOpen: false })}
                style={{
                  borderColor: colors.orange[600],
                  color: colors.orange[600],
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </div>
        </div>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} aria-label="a dense table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Created</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Code</StyledTableCell>
                <StyledTableCell>Address</StyledTableCell>
                <StyledTableCell>AddressLineTwo</StyledTableCell>
                <StyledTableCell>City</StyledTableCell>
                <StyledTableCell>State</StyledTableCell>
                <StyledTableCell>Postal</StyledTableCell>
                <StyledTableCell>Country</StyledTableCell>
                <StyledTableCell>Phone</StyledTableCell>
                <StyledTableCell>Fax</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Website</StyledTableCell>
                <StyledTableCell>CalendarStartTime</StyledTableCell>
                <StyledTableCell>CalendarEndTime</StyledTableCell>
                <StyledTableCell>FunctionalRange</StyledTableCell>
                <StyledTableCell>EIN</StyledTableCell>
                <StyledTableCell>NPI</StyledTableCell>
                <StyledTableCell>Order</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modal.data.map((result, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <StyledTableRow key={index}>
                  <TableCell component="th" scope="row">
                    {moment(result.dt).format("lll")}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.name}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.code}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.address}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.address2}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.city}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.state}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.postal}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.country}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.phone}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.fax}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.email}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.website}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.calendar_start_time}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.calendar_end_time}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.functional_range}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.ein}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.npi}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {result.concierge_lab_ordering}
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Dialog>
  );
}

ConfigModal.propTypes = {
  modal: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
      }),
    ),
  }).isRequired,
  setModal: PropTypes.func.isRequired,
};
