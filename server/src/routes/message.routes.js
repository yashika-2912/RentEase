const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function conversationId(a, b) {
  const x = String(a);
  const y = String(b);
  return [x, y].sort().join('_');
}

router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const mine = req.user._id;
    const msgs = await Message.find({
      $or: [{ sender: mine }, { receiver: mine }],
    }).sort({ createdAt: -1 });

    const map = new Map();
    for (const m of msgs) {
      const other = String(m.sender) === String(mine) ? m.receiver : m.sender;
      const cid = m.conversation;
      if (!map.has(cid)) {
        map.set(cid, {
          conversationId: cid,
          otherUser: other,
          lastMessage: m,
          unread: 0,
        });
      }
      const entry = map.get(cid);
      if (String(m.receiver) === String(mine) && !m.isRead) entry.unread += 1;
    }
    const others = [...map.values()].map((v) => v.otherUser);
    const users = await User.find({ _id: { $in: others } }).select('name email avatar role');
    const byId = Object.fromEntries(users.map((u) => [String(u._id), u]));
    const list = [...map.values()].map((v) => ({
      conversationId: v.conversationId,
      other: byId[String(v.otherUser)],
      lastMessage: v.lastMessage,
      unread: v.unread,
    }));
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/send', authenticate, async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ message: 'receiverId and content required' });
    const conv = conversationId(req.user._id, receiverId);
    const msg = await Message.create({
      conversation: conv,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });
    const io = req.app.get('io');
    if (io) {
      io.to(String(receiverId)).emit('message:receive', msg);
      io.to(String(req.user._id)).emit('message:receive', msg);
    }
    res.status(201).json(msg);
  } catch (e) {
    next(e);
  }
});

router.get('/:conversationId', authenticate, async (req, res, next) => {
  try {
    const mine = String(req.user._id);
    if (!req.params.conversationId.includes(mine)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const items = await Message.find({ conversation: req.params.conversationId }).sort({
      createdAt: 1,
    });
    await Message.updateMany(
      { conversation: req.params.conversationId, receiver: req.user._id },
      { $set: { isRead: true } }
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
