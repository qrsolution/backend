const UserAccount = require("../models/USER");

module.exports = {
  async verifyCode(req, res) {
    const { code } = req.params;

    try {
      const user = await UserAccount.findOne({ verification_code: code });

      if (user) {
        return res.json({ verified: true });
      } else {
        return res.json({ verified: false });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "An error occurred during verification" });
    }
  },
};
