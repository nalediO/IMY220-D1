const express = require('express');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

/* ---------- SEND FRIEND REQUEST ---------- */
router.post('/request', auth, async (req, res) => {
  try {

    console.log("Received friend request to:", req.body);
    const { toUserId } = req.body;

    if (!toUserId) {
      console.log("No target user ID provided");
      return res.status(400).json({ message: 'Target user is required' });
    }
    if (req.user._id.toString() === toUserId) {
      console.log("Cannot send friend request to oneself");
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: 'Target user not found' });

    // Already friends?
    if (toUser.friends.includes(req.user._id)) {
      console.log("Users are already friends");
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Only block if a *pending* request exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: toUserId },
        { from: toUserId, to: req.user._id }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      console.log("A pending friend request already exists between these users");``
      return res.status(400).json({ message: 'Friend request already pending' });
    }

    const friendRequest = await FriendRequest.create({
      from: req.user._id,
      to: toUserId,
      status: 'pending'
    });

    await friendRequest.populate('to', 'username firstName lastName profileImage');

    res.json({ message: 'Friend request sent', request: friendRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ---------- ACCEPT REQUEST ---------- */
router.post('/request/:requestId/accept', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId)
      .populate('from', 'username firstName lastName profileImage')
      .populate('to', 'username firstName lastName profileImage');

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    request.status = 'accepted';
    await request.save();

    await User.findByIdAndUpdate(request.from._id, { $addToSet: { friends: request.to._id } });
    await User.findByIdAndUpdate(request.to._id, { $addToSet: { friends: request.from._id } });

    await FriendRequest.findByIdAndDelete(request._id);

    res.json({ message: 'Friend request accepted', friend: request.from });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ---------- REJECT REQUEST ---------- */
router.post('/request/:requestId/reject', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ---------- CANCEL (DELETE) REQUEST ---------- */
router.delete('/request/:requestId', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only sender or receiver can cancel/delete
    if (
      request.from.toString() !== req.user._id.toString() &&
      request.to.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    await FriendRequest.deleteOne({ _id: req.params.requestId });
    res.json({ message: 'Friend request cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ---------- GET PENDING REQUESTS ---------- */
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ to: req.user._id, status: 'pending' })
      .populate('from', 'username firstName lastName profileImage');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ---------- GET FRIEND LIST ---------- */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username firstName lastName profileImage');
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ---------- REMOVE FRIEND ---------- */
router.delete('/:friendId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: req.params.friendId } });
    await User.findByIdAndUpdate(req.params.friendId, { $pull: { friends: req.user._id } });
    res.json({ message: 'Friend removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/requests/outgoing', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ from: req.user._id, status: 'pending' })
      .populate('to', 'username firstName lastName profileImage');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
