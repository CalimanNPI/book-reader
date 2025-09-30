const multer = require("multer");
const upload = multer({ dest: "uploads/" });

module.exports = {
  upload: async (req, res) => {
    const user = req.user.id;
    const notes = await Note.find({ user }).sort({ date: "desc" }).lean();
    res.render("notes/all-notes", { notes });
  },
};
