const Message = require("../models/Message");
const User = require("../models/User");
const Profile = require("../models/Profile");

const getId = (value) => (value && value._id ? value._id.toString() : value.toString());

const serializeMessage = (msg) => ({
  id: msg._id.toString(),
  sender_id: getId(msg.senderId),
  receiver_id: getId(msg.receiverId),
  content: msg.deletedForEveryone ? "" : msg.content,
  attachments: msg.deletedForEveryone ? [] : (msg.attachments || []),
  is_deleted_for_everyone: msg.deletedForEveryone,
  is_read: msg.isRead,
  created_at: msg.createdAt
});

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      deletedFor: { $ne: userId }
    }).sort({ createdAt: 1 }).populate("senderId", "fullName").populate("receiverId", "fullName");

    const conversationsMap = {};

    for (const msg of messages) {
      if (!msg.senderId || !msg.receiverId) continue;
      const isSender = msg.senderId._id.toString() === userId.toString();
      const partnerUser = isSender ? msg.receiverId : msg.senderId;
      
      const partnerId = partnerUser._id.toString();
      
      if (!conversationsMap[partnerId]) {
        const partnerProfile = await Profile.findOne({ userId: partnerId });
        conversationsMap[partnerId] = {
          partner_id: partnerId,
          partner_name: partnerUser.fullName || "Deleted User",
          partner_avatar: partnerProfile ? partnerProfile.avatar : "",
          messages: [],
          unread_count: 0,
          last_message: null,
          last_message_date: null
        };
      }

      const msgObj = serializeMessage(msg);

      conversationsMap[partnerId].messages.push(msgObj);
      // Always update last_message to latest (messages are sorted by createdAt ASC)
      conversationsMap[partnerId].last_message = msgObj;
      conversationsMap[partnerId].last_message_date = msg.createdAt;

      if (!isSender && !msg.isRead) {
        conversationsMap[partnerId].unread_count += 1;
      }
    }

    const conversation_list = Object.values(conversationsMap).sort((a, b) => {
      return new Date(b.last_message_date || 0) - new Date(a.last_message_date || 0);
    });

    return res.json({ success: true, conversations: conversation_list });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const partnerId = req.params.partnerId;

    // Get the partner user info
    const partnerUser = await User.findById(partnerId);
    if (!partnerUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const partnerProfile = await Profile.findOne({ userId: partnerId });

    // Get all messages between current user and partner
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ],
      deletedFor: { $ne: userId }
    }).sort({ createdAt: 1 });

    // Mark incoming messages as read
    await Message.updateMany(
      { senderId: partnerId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({
      success: true,
      partner: {
        id: partnerUser._id.toString(),
        full_name: partnerUser.fullName,
        avatar: partnerProfile ? partnerProfile.avatar : "",
        role: partnerUser.role
      },
      messages: messages.map(serializeMessage)
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    // Accept receiverId from body OR partnerId from URL params
    const receiverId = req.body.receiverId || req.params.partnerId;
    const content = (req.body.content || "").trim();
    const files = req.files || [];
    
    if (!receiverId || (!content && files.length === 0)) {
      return res.status(400).json({ success: false, message: "Receiver and message content or media required." });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found." });
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      content,
      attachments: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: file.mimetype.startsWith("video/") ? "video" : "image",
      })),
      isRead: false
    });

    return res.json({
      success: true,
      message_id: newMessage._id,
      message: "Message sent."
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const scope = req.body.scope || req.query.scope || "me";
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const userId = req.user._id.toString();
    const senderId = message.senderId.toString();
    const receiverId = message.receiverId.toString();
    const isParticipant = senderId === userId || receiverId === userId;

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "You are not allowed to delete this message." });
    }

    if (scope === "everyone") {
      if (senderId !== userId) {
        return res.status(403).json({ success: false, message: "Only the sender can delete a message for everyone." });
      }

      message.deletedForEveryone = true;
      message.deletedAt = new Date();
      message.content = "";
      message.attachments = [];
      await message.save();
      return res.json({ success: true, message: "Message deleted for everyone." });
    }

    await Message.updateOne(
      { _id: messageId },
      { $addToSet: { deletedFor: req.user._id } }
    );

    return res.json({ success: true, message: "Message deleted for you." });
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    await Message.updateMany(
      { senderId: partnerId, receiverId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getConversation,
  sendMessage,
  deleteMessage,
  markRead
};
