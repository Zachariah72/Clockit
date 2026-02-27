const ListeningGroup = require('../models/ListeningGroup');

// Create a new listening group
const createGroup = async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;
        const userId = req.user.id;

        const group = new ListeningGroup({
            name,
            description,
            creator: userId,
            members: [userId],
            isPublic: isPublic !== undefined ? isPublic : true
        });

        await group.save();
        await group.populate('creator', 'username profilePicture');
        res.status(201).json(group);
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get joined groups
const getJoinedGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await ListeningGroup.find({
            $or: [{ creator: userId }, { members: userId }]
        }).populate('creator', 'username profilePicture')
            .populate('members', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.json(groups);
    } catch (err) {
        console.error('Error fetching joined groups:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Discover public groups
const discoverGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await ListeningGroup.find({
            isPublic: true,
            creator: { $ne: userId },
            members: { $ne: userId }
        }).populate('creator', 'username profilePicture')
            .limit(20)
            .sort({ createdAt: -1 });

        res.json(groups);
    } catch (err) {
        console.error('Error discovering groups:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Join a group
const joinGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const group = await ListeningGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
        }

        await group.populate('creator', 'username profilePicture');
        await group.populate('members', 'username profilePicture');

        res.json(group);
    } catch (err) {
        console.error('Error joining group:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Leave a group
const leaveGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const group = await ListeningGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.members = group.members.filter(m => m.toString() !== userId);

        // If creator leaves, assign new creator or delete group? 
        // For now, let's just keep the original creator or delete if empty.
        if (group.members.length === 0) {
            await ListeningGroup.findByIdAndDelete(group._id);
            return res.json({ message: 'Group deleted (empty)' });
        }

        await group.save();
        res.json({ message: 'Left group' });
    } catch (err) {
        console.error('Error leaving group:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update group playback state
const updatePlayback = async (req, res) => {
    try {
        const { currentTrack, isPlaying, currentTime } = req.body;
        const userId = req.user.id;

        const group = await ListeningGroup.findOneAndUpdate(
            { _id: req.params.id, members: userId },
            {
                currentTrack,
                isPlaying,
                currentTime,
                lastSyncAt: Date.now()
            },
            { new: true }
        );

        if (!group) {
            return res.status(404).json({ message: 'Group not found or unauthorized' });
        }

        res.json(group);
    } catch (err) {
        console.error('Error updating playback:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createGroup,
    getJoinedGroups,
    discoverGroups,
    joinGroup,
    leaveGroup,
    updatePlayback
};
