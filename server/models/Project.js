const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member', 'viewer'],
          default: 'member',
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived', 'on-hold'],
      default: 'active',
    },
    color: {
      type: String,
      default: '#6366F1',
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Automatically add owner as admin member
projectSchema.pre('save', function (next) {
  if (this.isNew) {
    const isOwnerMember = this.members.some(
      (m) => m.user && m.user.toString() === this.owner.toString()
    );
    if (!isOwnerMember) {
      this.members.push({ user: this.owner, role: 'admin' });
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
