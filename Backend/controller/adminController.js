const jwt = require("jsonwebtoken");
const SESSION_SECRET = process.env.SESSION_SECRET;

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ username }, SESSION_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } else {
    res
      .status(401)
      .json({ error: "Login gagal. Username atau password salah." });
  }
};

exports.logout = (req, res) => {
  res.json({ message: "Logout berhasil "});
};

exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tidak dikirim" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid" });
  }
};
