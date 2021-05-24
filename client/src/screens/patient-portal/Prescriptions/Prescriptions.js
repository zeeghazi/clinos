import React, { useState, useEffect, useCallback } from "react";

import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import PatientPortalService from "../../../services/patient_portal/patient-portal.service";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: "40px 0px",
  },
  title: {
    paddingBottom: theme.spacing(1),
  },
}));

const Prescriptions = () => {
  const classes = useStyles();
  const [prescriptions, setPrescriptions] = useState([]);

  const fetchPrescriptions = useCallback(() => {
    PatientPortalService.getPrescriptions().then((res) => {
      setPrescriptions(res.data);
    });
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return (
    <div className={classes.root}>
      <Typography
        component="h1"
        variant="h2"
        color="textPrimary"
        className={classes.title}
      >
        Prescriptions
      </Typography>
      {
        Boolean(prescriptions.length) && prescriptions.map((item) => (
          <Typography
            key={item.id}
            gutterBottom
          >
            {item.id}
          </Typography>
        ))
      }
    </div>
  );
};

export default Prescriptions;
