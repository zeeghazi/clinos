import React from "react";

import {
  colors,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Proptypes from "prop-types";

const useStyles = makeStyles((theme) => ({
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
    minHeight: "450px",
  },
  tableContainer: {
    minWidth: 450,
    marginTop: theme.spacing(2),
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
      padding: "6px 16px",
      fontSize: 12,
      height: "50px",
    },
  },
}))(TableRow);

const CptGroupMembersModal = ({ isOpen, hendleOnClose, groups }) => {
  const classes = useStyles();
  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="lg"
        open={isOpen}
        onClose={hendleOnClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={classes.title}>
          CPT Group Members
        </DialogTitle>
        <DialogContent className={classes.content}>
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table className={classes.table} aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Code</StyledTableCell>
                  <StyledTableCell align="left">Description</StyledTableCell>
                  <StyledTableCell>Lab Company</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((item) => (
                  <StyledTableRow key={item.id}>
                    <TableCell component="th" scope="row">
                      {item.id}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.leb}</TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
        </DialogActions>
      </Dialog>
    </div>
  );
};

CptGroupMembersModal.propTypes = {
  isOpen: Proptypes.bool.isRequired,
  hendleOnClose: Proptypes.func.isRequired,
  groups: Proptypes.arrayOf(
    Proptypes.shape({
      id: Proptypes.string,
      description: Proptypes.string,
      leb: Proptypes.string,
    }),
  ).isRequired,
};

export default CptGroupMembersModal;
