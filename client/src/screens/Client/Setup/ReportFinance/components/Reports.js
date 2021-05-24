import React from "react";

import Paper from "@material-ui/core/Paper";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import moment from "moment";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    minWidth: 1000,
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
  detailLink: {
    color: theme.palette.text.link,
    cursor: "pointer",
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
    },
    "& td": {
      fontSize: 12,
    },
  },
}))(TableRow);
const TotalTableRow = withStyles((theme) => ({
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
      fontWeight: "bold",
    },
  },
}))(TableRow);

const Reports = ({ reports, ...props }) => {
  const { dateFrom, dateTo } = props;
  const classes = useStyles();
  const history = useHistory();

  const formatAmount = (value) => value?.toFixed(2) || "0.00";
  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <StyledTableCell padding="checkbox">Year</StyledTableCell>
            <StyledTableCell padding="checkbox">Month</StyledTableCell>
            <StyledTableCell padding="checkbox">Total</StyledTableCell>
            <StyledTableCell padding="checkbox">Service</StyledTableCell>
            <StyledTableCell padding="checkbox">Credit</StyledTableCell>
            <StyledTableCell padding="checkbox">Payment</StyledTableCell>
            <StyledTableCell padding="checkbox">Refund</StyledTableCell>
            <StyledTableCell padding="checkbox">Detail</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <StyledTableRow key={report.id}>
              <TableCell
                style={{ whiteSpace: "nowrap" }}
                padding="checkbox"
                component="th"
                scope="row"
              >
                {report.year}
              </TableCell>
              <TableCell>{moment(report.month, "M").format("MMM")}</TableCell>
              <TableCell padding="checkbox">{`$${formatAmount(report.Total)}`}</TableCell>
              <TableCell padding="checkbox">{`$${formatAmount(report.Service)}`}</TableCell>
              <TableCell padding="checkbox">{`$${formatAmount(report.Credit)}`}</TableCell>
              <TableCell padding="checkbox">{`$${formatAmount(report.Payment)}`}</TableCell>
              <TableCell padding="checkbox">{`$${formatAmount(report.Refund)}`}</TableCell>
              <TableCell
                className={classes.detailLink}
                onClick={() => history.push(
                  `/reports/report-finance-detail/${dateFrom}/${dateTo}`,
                )}
                padding="checkbox"
              >
                Detail
              </TableCell>
            </StyledTableRow>
          ))}
          <TotalTableRow>
            <TableCell padding="checkbox" colSpan={2} align="right">
              Total
            </TableCell>
            <TableCell padding="checkbox" colSpan={1} align="left">
              {`$${formatAmount(reports.reduce((a, b) => a + b.Total, 0))}`}
            </TableCell>
            <TableCell padding="checkbox" colSpan={1} align="left">
              {`$${formatAmount(reports.reduce((a, b) => a + b.Service, 0))}`}
            </TableCell>
            <TableCell padding="checkbox" colSpan={1} align="left">
              {`$${formatAmount(reports.reduce((a, b) => a + b.Credit, 0))}`}
            </TableCell>
            <TableCell padding="checkbox" colSpan={1} align="left">
              {`$${formatAmount(reports.reduce((a, b) => a + b.Payment, 0))}`}
            </TableCell>
            <TableCell padding="checkbox" colSpan={1} align="left">
              <div style={{ marginLeft: "5px" }}>
                {`$${formatAmount(reports.reduce(
                  (a, b) => a + b.Refund,
                  0,
                ))}`}
              </div>
            </TableCell>
          </TotalTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

Reports.propTypes = {
  reports: PropTypes.arrayOf(
    PropTypes.arrayOf({
      month: PropTypes.string.isRequired,
      Total: PropTypes.number.isRequired,
      Service: PropTypes.string.isRequired,
      Credit: PropTypes.string.isRequired,
      Payment: PropTypes.string.isRequired,
      Refund: PropTypes.string.isRequired,
    }),
  ).isRequired,
  dateFrom: PropTypes.string.isRequired,
  dateTo: PropTypes.string.isRequired,
};

export default Reports;
