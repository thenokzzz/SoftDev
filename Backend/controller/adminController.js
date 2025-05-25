const path = require("path");

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    req.session.admin = { username };
    res.redirect("/admin/dashboard"); 
  } else {
    res.send("Login gagal. Username atau password salah.");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

