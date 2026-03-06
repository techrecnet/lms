const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    doj: {
      type: Date,
      default: Date.now,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
    },
    profileImage: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
mentorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
mentorSchema.methods.comparePassword = async function (passwordToCheck) {
  return bcrypt.compare(passwordToCheck, this.password);
};

// Remove password from toJSON
mentorSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Mentor', mentorSchema);
