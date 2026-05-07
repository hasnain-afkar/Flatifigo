const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getConversations,
  getConversation,
  sendMessage,
  deleteMessage,
  markRead
} = require("../controllers/messageController");

router.use(authMiddleware);

router.get("/", getConversations);
router.get("/:partnerId", getConversation);
router.post("/", upload.messageMedia.array("attachments", 5), sendMessage);
router.post("/:partnerId", upload.messageMedia.array("attachments", 5), sendMessage);
router.put("/read/:partnerId", markRead);
router.delete("/:messageId", deleteMessage);

module.exports = router;
