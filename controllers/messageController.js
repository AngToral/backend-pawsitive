const { messageModel } = require("../models/message.model");

exports.sendMessage = async (req, res) => {
    try {
        const message = new messageModel({
            sender: req.user.id,
            receiver: req.body.receiver,
            content: req.body.content,
        });
        await message.save();
        await createNotification('message', req.user.id, req.body.receiver);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
