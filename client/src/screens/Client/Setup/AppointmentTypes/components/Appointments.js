import React from "react";

import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/EditOutlined";
import moment from "moment";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    minWidth: 650,
    marginTop: theme.spacing(2),
  },
  actions: {
    textAlign: "center",
    display: "flex",
    border: "none",
    "& button": {
      fontSize: "12px",
    },
  },
  overflowControl: {
    maxWidth: "130px",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
}));
const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0,0,0,0.87)",
    boxShadow: theme.shadows[1],
    fontSizw: 13,
  },
}))(Tooltip);
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
    },
    "& td": {
      fontSize: 12,
      height: "50px",
    },
  },
}))(TableRow);

const Appointments = ({
  appointments, onEdit, onDelete,
}) => {
  const classes = useStyles();
  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table size="small" className={classes.table} aria-label="a dense table">
        <TableHead>
          <TableRow>
            <StyledTableCell padding="checkbox">
              Appointment Type
            </StyledTableCell>
            <StyledTableCell padding="checkbox">Portal Name</StyledTableCell>
            <StyledTableCell padding="checkbox">Minutes</StyledTableCell>
            <StyledTableCell padding="checkbox">
              Patient Schedule
            </StyledTableCell>
            <StyledTableCell padding="checkbox">Order</StyledTableCell>
            <StyledTableCell padding="checkbox" align="center">
              Note
            </StyledTableCell>
            <StyledTableCell padding="checkbox">Status</StyledTableCell>
            <StyledTableCell padding="checkbox">Created</StyledTableCell>
            <StyledTableCell padding="checkbox">Created By</StyledTableCell>
            <StyledTableCell padding="checkbox">Updated</StyledTableCell>
            <StyledTableCell padding="checkbox">Updated By</StyledTableCell>
            <StyledTableCell padding="checkbox">
              Actions
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => (
            <StyledTableRow key={appointment.id}>
              <TableCell padding="checkbox" component="th" scope="row">
                {appointment.appointment_type}
              </TableCell>
              <TableCell padding="checkbox">
                {appointment.appointment_name_portal}
              </TableCell>
              <TableCell padding="checkbox">{appointment.length}</TableCell>
              <TableCell padding="checkbox">
                {appointment.allow_patients_schedule ? "Yes" : "No"}
              </TableCell>
              <TableCell padding="checkbox">{appointment.sort_order}</TableCell>
              {appointment.note && appointment.note.length > 0 ? (
                <LightTooltip title={appointment.note}>
                  <TableCell
                    padding="checkbox"
                    className={classes.overflowControl}
                    align="center"
                  >
                    {appointment.note}
                  </TableCell>
                </LightTooltip>
              ) : (
                <TableCell
                  padding="checkbox"
                  className={classes.overflowControl}
                  align="center"
                >
                  {appointment.note || ""}
                </TableCell>
              )}
              <TableCell padding="checkbox">
                {appointment.active ? "Active" : "-"}
              </TableCell>
              <TableCell padding="checkbox">
                {moment(appointment.created).format("lll")}
              </TableCell>
              <TableCell padding="checkbox">
                {appointment.created_user}
              </TableCell>
              <TableCell padding="checkbox">
                {appointment.updated
                  ? moment(appointment.updated).format("lll")
                  : "-"}
              </TableCell>
              <TableCell padding="checkbox">
                {appointment.updated_user || "-"}
              </TableCell>
              <TableCell padding="checkbox" className={classes.actions}>
                <IconButton
                  aria-label="edit"
                  className={classes.margin}
                  onClick={() => onEdit(appointment.id)}
                >
                  <EditIcon fontSize="medium" />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  className={classes.margin}
                  onClick={() => onDelete(appointment.id)}
                >
                  <DeleteIcon fontSize="medium" />
                </IconButton>
              </TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

Appointments.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.arrayOf({
      id: PropTypes.string,
      appointment_type: PropTypes.string,
      appointment_name_portal: PropTypes.string,
      length: PropTypes.string,
      allow_patients_schedule: PropTypes.bool,
      sort_order: PropTypes.number,
      note: PropTypes.string,
      created: PropTypes.string,
      created_user: PropTypes.string,
      updated: PropTypes.string,
      updated_user: PropTypes.string,
    }),
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Appointments;
