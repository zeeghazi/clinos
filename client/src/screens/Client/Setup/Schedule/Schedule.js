import React, {
  useEffect, useState, useCallback, useMemo,
} from "react";

import {
  Button, Container, CssBaseline, makeStyles,
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";
import moment from "moment";

import ScheduleService from "../../../../services/schedule.service";
import DeleteSchedule from "./component/modal/DeleteSchedule";
import NewOrEditSchedule from "./component/modal/NewOrEditSchedule";
import ScheduleSearchForm from "./component/ScheduleSearchForm";
import ScheduleSearchResultTable from "./component/ScheduleSearchResultTable";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: "25px 0px",
  },
  uploadButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "480px",
    "& h1": {
      [theme.breakpoints.up("md")]: {
        marginRight: theme.spacing(1),
      },
    },
  },
  card: {
    minHeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noContent: {
    marginTop: theme.spacing(2),
  },
}));

const Schedule = () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewSchedule, setIsNewSchedule] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userId, setUserId] = useState("");
  const [selectedScheduleValues, setSelectedScheduleValues] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [fetchingCompleted, setFetchingCompleted] = useState(false);

  const payload = useMemo(() => ({ userId }), [userId]);

  const getUserList = () => {
    ScheduleService.getAllUsers().then((res) => {
      setUserList(res.data.data);
    });
  };

  const fetchScheduleSearch = useCallback(() => {
    ScheduleService.search(payload).then((res) => {
      setSearchResult(res.data.data);
      setFetchingCompleted(true);
    });
  }, [payload]);

  useEffect(() => {
    getUserList();
    fetchScheduleSearch();
  }, [fetchScheduleSearch]);

  const handleChangeOfUserId = (e) => {
    setUserId(e.target.value);
  };

  const handleOnNewClick = () => {
    setIsOpen(true);
    setIsNewSchedule(true);
    setSelectedScheduleValues({
      user_id: userId,
      date_start: moment(),
      date_end: `${moment().add(3, "M")}`,
      time_start: "09:00:00",
      time_end: "15:00:00",
      active: true,
      note: "",
    });
  };
  const handleOnEditClick = (id) => {
    setIsOpen(true);
    setIsNewSchedule(false);
    const scheduleById = searchResult.filter((result) => result.id === id);
    if (scheduleById) {
      setSelectedScheduleValues(_.head(scheduleById));
    }
  };

  const handleDeleteSchedule = (id) => {
    setIsDeleteModalOpen(true);
    setSelectedScheduleId(id);
  };

  return (

    <>
      <CssBaseline>
        <Container maxWidth={false} className={classes.root}>
          <div className={classes.uploadButtons}>
            <Typography component="h1" variant="h2" color="textPrimary">
              Schedule
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              component="span"
              onClick={handleOnNewClick}
            >
              New
            </Button>
          </div>
          <Grid container justify="center" spacing={2}>
            <Grid item md={12} xs={12}>
              <Typography component="p" variant="body2" color="textPrimary">
                This page is used to set availability for new patient
                appointments.
              </Typography>
              <ScheduleSearchForm
                userList={userList}
                userId={userId}
                handleChangeOfUserId={handleChangeOfUserId}
                fetchScheduleSearch={fetchScheduleSearch}
              />
              {searchResult.length > 0
                ? (
                  <ScheduleSearchResultTable
                    handleOnEditClick={handleOnEditClick}
                    searchResult={searchResult}
                    fetchScheduleSearch={fetchScheduleSearch}
                    handleDeleteSchedule={handleDeleteSchedule}
                  />
                )
                : fetchingCompleted && <p className={classes.noContent}>No result found!</p>}
            </Grid>
          </Grid>
          <NewOrEditSchedule
            isOpen={isOpen}
            handleOnClose={() => setIsOpen(false)}
            isNewSchedule={isNewSchedule}
            userList={userList}
            userId={userId}
            handleChangeOfUserId={handleChangeOfUserId}
            fetchScheduleSearch={fetchScheduleSearch}
            schedule={selectedScheduleValues}
          />
          <DeleteSchedule
            isDeleteModalOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            fetchScheduleSearch={fetchScheduleSearch}
            id={selectedScheduleId}
          />
        </Container>
      </CssBaseline>
    </>
  );
};

export default Schedule;
