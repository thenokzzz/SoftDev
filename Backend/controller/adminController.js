const path = require("path");

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    res.sendFile(
      path.join(__dirname, "../../Frontend/HTML/admin_dashboard.html")
    );
  } else {
    res.send("Login gagal. Username atau password salah.");
  }
};

exports.logout = (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.sendFile(path.join(__dirname, "../../Frontend/HTML/admin_login.html"));
    });
  } else {
    // fallback jika session tidak ada
    res.sendFile(path.join(__dirname, "../../Frontend/HTML/admin_login.html"));
  }
};

