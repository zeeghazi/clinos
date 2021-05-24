// middleware for doing role-based permissions
const permit = (...permittedRoles) => {
  // return a middleware
  return (request, response, next) => {
    const { user_role } = request;

    if (user_role && permittedRoles.includes(user_role)) {
      next(); // role is allowed, so continue on the next middleware
    } else {
      response.status(403).json({ message: "Forbidden" }); // user is forbidden
    }
  };
};

const authorization = {
  permit,
};

module.exports = authorization;
