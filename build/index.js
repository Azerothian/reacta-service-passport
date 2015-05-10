(function() {
  var Promise, passport;

  Promise = require("native-or-bluebird");

  passport = require("passport");

  module.exports = function(config) {
    return new Promise(function(resolve, reject) {
      if (config.serializeUser != null) {
        passport.serializeUser = config.serializeUser;
      }
      if (config.deserializeUser) {
        passport.deserializeUser = config.deserializeUser;
      }
      return resolve({
        deps: {
          "passport-session": ["session", "passport"],
          "/auth/logout": ["passport-session"]
        },
        modules: {
          "passport": passport.initialize(),
          "passport-session": passport.session(),
          "passport-logout": function(req, res, next) {
            req.logout();
            return req.redirect(config.logoutPath);
          },
          "passport-login-success": function(req, res, next) {
            return res.redirect(config.loginSuccess);
          }
        },
        routes: {
          "get": {
            "/auth/logout": ["passport-logout"]
          }
        }
      });
    });
  };

  module.exports.createStrategy = function(name, strategy, config, callback) {
    return new Promise(function(resolve, reject) {
      var authName, callbackName, getName, results;
      passport.use(new strategy(config, callback));
      authName = "passport-authenticate-" + name;
      getName = "/auth/" + name;
      callbackName = "/auth/" + name + "/callback";
      results = {
        deps: {},
        modules: {},
        routes: {
          get: {}
        }
      };
      results.deps[authName] = ["passport-session"];
      results.modules[authName] = passport.authenticate(name);
      results.routes.get[getName] = [authName];
      results.routes.get[callbackName] = [authName, "passport-login-success"];
      return resolve(results);
    });
  };

}).call(this);
