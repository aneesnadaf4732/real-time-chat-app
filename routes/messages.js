const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  try {
    const { content, room } = req.body;
    const message = new Message({
      content,
      room,
      user: req.userId
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

router.get('/:room', auth, async (req, res, next) => {
  try {
    const messages = await Message.find({ room: req.params.room }).populate('user', 'username');
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;