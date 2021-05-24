import React, { useEffect } from "react";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useSnackbar } from "notistack";

import Logo from "../../assets/img/Logo.png";
import Error from "../../components/common/Error";
import useAuth from "../../hooks/useAuth";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 15px 35px 0 rgb(60 66 87 / 8%), 0 5px 15px 0 rgb(0 0 0 / 12%)",
    padding: theme.spacing(2),
  },
  marginTop: {
    marginTop: theme.spacing(16),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
  },
  lockIcon: {
    fontSize: "40px",
  },
  pageTitle: {
    marginBottom: theme.spacing(3),
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  Logo: {
    maxWidth: "180px",
  },
}));

const Login = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isChecked, setIsChecked] = React.useState(false);
  const [errors, setErrors] = React.useState([]);

  const onFormSubmit = async (event) => {
    event.preventDefault();

    if (isChecked && email !== "") {
      localStorage.username = email;
      localStorage.password = password;
      localStorage.rememberme = isChecked;
    }

    try {
      await login(email.trim(), password.trim()); // Call AuthProvider login
      // enqueueSnackbar("Successfully logged in!", {
      //  variant: "success",
      // });
    } catch (error) {
      enqueueSnackbar("Unable to login", {
        variant: "error",
      });
      setErrors(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.rememberme && localStorage.username !== "") {
      setIsChecked(true);
      setEmail(localStorage.username);
      setPassword(localStorage.password);
    }
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <Grid className={classes.marginTop}>
        <img src={Logo} alt="AvonHealth" className={classes.Logo} />
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon className={classes.lockIcon} />
          </Avatar>
          <Typography
            component="h1"
            variant="h2"
            className={classes.pageTitle}
          >
            Physician Login
          </Typography>
          <Error errors={errors} />

          <form
            className={classes.form}
            noValidate
            onSubmit={(event) => onFormSubmit(event)}
          >
            <TextField
              value={email}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(event) => setEmail(event.target.value)}
              inputProps={{ maxLength: 255 }}
              helperText={`${email.length >= 255
                ? "Enter an email between 255 charecter"
                : ""
              }`}
            />
            <TextField
              value={password}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              inputProps={{ maxLength: 128 }}
              helperText={`${password.length >= 128
                ? "Enter a password between 128 charecter"
                : ""
              }`}
            />
            <FormControlLabel
              control={(
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={isChecked}
                  onChange={(event) => setIsChecked(event.target.checked)}
                />
              )}
              label="Remember me"
            />
            <Button
              type="submit"
              disabled={!email || !password}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup_client" variant="body2">
                  Don&apos;t have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Grid>
    </Container>
  );
};

export default Login;
