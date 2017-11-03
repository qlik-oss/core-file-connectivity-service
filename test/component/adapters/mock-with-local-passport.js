const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

class MockWithLocalPassport {
  constructor(returnData, username, password) {
    this.returnData = returnData;
    this.username = username;
    this.password = password;
    this.auth = false;

    const that = this;

    passport.use(new LocalStrategy((userName, pwd, done) => {
      if (userName === that.username && pwd === that.password) {
        that.auth = true;
        return done(null, {});
      }

      return done(null, false);
    }));
  }

  getData() {
    return this.returnData;
  }

  authenticated() {
    return this.auth;
  }

  authentication() { // eslint-disable-line
    return passport.authenticate('local');
  }
}

module.exports = MockWithLocalPassport;
