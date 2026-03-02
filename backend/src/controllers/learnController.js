const LearningPath = require('../models/LearningPath');
const UserLearnProgress = require('../models/UserLearnProgress');

exports.getLearningPaths = async (req, res) => {
  try {
    const disciplineId = req.query.discipline;
    const filter = disciplineId ? { disciplineId, isPublished: true } : { isPublished: true };
    const paths = await LearningPath.find(filter).sort({ order: 1 });
    res.json({ success: true, data: paths });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPathDetail = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ id: req.params.id, isPublished: true });
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { lessonId, courseId, isCompleted, lastPosition } = req.body;
    const userId = req.user.id;

    const progress = await UserLearnProgress.findOneAndUpdate(
      { userId, lessonId },
      { 
        courseId, 
        isCompleted, 
        lastPosition, 
        lastAccessed: Date.now() 
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await UserLearnProgress.find({ userId: req.user.id });
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
