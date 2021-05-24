import React, { useEffect, useState } from "react";

import Box from "@material-ui/core/Box";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Alert } from "@material-ui/lab";
import moment from "moment";
import ReactHtmlParser from "react-html-parser";
import { Link } from "react-router-dom";

import useAuth from "../../../hooks/useAuth";
import HomeService from "../../../services/patient_portal/home.service";

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingTop: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  },
  Logo: {
    backgroundColor: "grey",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
  },
  BoxStyle: {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.borderColor,
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "7px",
    margin: "10px 0",
  },
  formBox: {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.borderColor,
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "7px",
    margin: "5px 0 40px 0",
  },
  pageTitle: {
    marginBottom: theme.spacing(2),
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  withErrors: {
    opacity: 0.9,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  rescheduleLink: {
    marginLeft: theme.spacing(1),
  },
}));

const Home = () => {
  const classes = useStyles();
  const [header, setHeader] = useState({});
  const { lastVisitedPatient } = useAuth();
  const [clientForms, setClientForms] = useState({});
  const [upcomingAppointments, setUpcomingAppointments] = useState({});

  useEffect(() => {
    HomeService.getClientHeader(lastVisitedPatient).then(
      (response) => {
        setHeader(response.data[0]);
      },
      (error) => {
        console.error("error", error);
      },
    );
    HomeService.getClientForms(lastVisitedPatient).then(
      (response) => {
        setClientForms(response.data[0]);
      },
      (error) => {
        console.error("error", error);
      },
    );
    HomeService.getUpcomingAppointments(lastVisitedPatient).then(
      (response) => {
        setUpcomingAppointments(response.data);
      },
      (error) => {
        console.error("error", error);
      },
    );
  }, [lastVisitedPatient]);

  const formatAppointmentType = (status) => {
    if (status === "A") {
      return "scheduled";
    }
    if (status === "R") {
      return "requested";
    }
    return "";
  };

  const renderAppointmentRowText = ({
    provider, start_dt, end_dt, status,
  }) => {
    const formattedStatus = formatAppointmentType(status);
    const formattedStartDate = moment(start_dt).format("MMM Do YYYY, h:mm a");
    const formattedEndDate = moment(end_dt).format("h:mm  a");

    return `Appointment ${formattedStatus} with ${provider} on ${formattedStartDate} - ${formattedEndDate}`;
  };

  return (
    <div className={classes.paper}>
      <CssBaseline />
      <Typography component="h1" variant="h2" className={classes.pageTitle}>
        Portal Home
      </Typography>
      <Alert icon={false} variant="filled" severity="info">
        {header && ReactHtmlParser(header.header)}
      </Alert>
      {Boolean(upcomingAppointments?.length)
        && upcomingAppointments?.filter(((appointment) => appointment?.status !== "D")).map((appointment) => (
          <Box component="div" className={classes.BoxStyle} key={appointment.id}>
            <p>
              {renderAppointmentRowText(appointment)}
              <Link
                to={{ pathname: "/patient/appointments", state: { appointment } }}
                className={classes.rescheduleLink}
              >
                Request Reschedule Appointment
              </Link>
            </p>
          </Box>
        ))}

      {clientForms && (
        <Box component="div" className={classes.formBox}>
          <p>
            Please fill out the following forms:
            {" "}
            <Link to="/">{clientForms.title}</Link>
          </p>
        </Box>
      )}
    </div>
  );
};

export default Home;
