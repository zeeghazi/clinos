import React, { useEffect, useState } from "react";

import { CssBaseline, makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import CPTCodesService from "../../../../services/cpt.service";
import CPTform from "./component/CPTform";
import CPTtable from "./component/CPTtable";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: "25px 0px",
  },
  title: {
    paddingBottom: theme.spacing(0.5),
  },
}));

export default function CTPcodes() {
  const classes = useStyles();
  const [lebCompanyList, setLabCompanyList] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [cptId, setCptId] = useState("");
  const [cptDescription, setCptDescription] = useState("");
  const [labCompanyId, setLabCompanyId] = useState("");
  const [favorite, setFavorite] = useState("");
  const [billable, setBillable] = useState("");
  const [self, setSelf] = useState("");
  const [group, setGroup] = useState("");
  const payload = {
    cptId,
    cptDescription,
    labCompanyId,
    favorite,
    billable,
    self,
    group,
  };

  const fetchLabCompanyList = () => {
    CPTCodesService.getLabCompnayList().then((res) => {
      setLabCompanyList(res.data);
    });
  };

  useEffect(() => {
    fetchLabCompanyList();
  }, []);

  const fetchCptCodeSearch = () => {
    CPTCodesService.search(payload).then((res) => {
      setSearchResult(res.data.data);
    });
  };

  const handleChangeOfCptId = (e) => {
    setCptId(e.target.value);
  };
  const handleChangeOfCptDescription = (e) => {
    setCptDescription(e.target.value);
  };
  const handleChangeOfLabCompanyId = (e) => {
    setLabCompanyId(e.target.value);
  };
  const handleChangeOfFavorite = (e) => {
    setFavorite(e.target.checked);
  };
  const handleChangeOfBillable = (e) => {
    setBillable(e.target.checked);
  };
  const handleChangeOfSelf = (e) => {
    setSelf(e.target.checked);
  };
  const handleChangeOfGroup = (e) => {
    setGroup(e.target.checked);
  };

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        <Typography
          component="h1"
          variant="h2"
          color="textPrimary"
          className={classes.title}
        >
          CPT Codes
        </Typography>
        <Typography component="p" variant="body2" color="textPrimary">
          This page is used to manage CTP codes
        </Typography>
        <CPTform
          lebCompanyList={lebCompanyList}
          fetchCptCodeSearch={fetchCptCodeSearch}
          handleChangeOfCptId={handleChangeOfCptId}
          handleChangeOfCptDescription={handleChangeOfCptDescription}
          handleChangeOfLabCompanyId={handleChangeOfLabCompanyId}
          handleChangeOfFavorite={handleChangeOfFavorite}
          handleChangeOfBillable={handleChangeOfBillable}
          handleChangeOfSelf={handleChangeOfSelf}
          handleChangeOfGroup={handleChangeOfGroup}
          labCompanyId={labCompanyId}
        />
        {searchResult.length > 0 && (
          <CPTtable
            searchResult={searchResult}
            fetchCptCodeSearch={fetchCptCodeSearch}
          />
        )}
      </div>
    </>
  );
}
