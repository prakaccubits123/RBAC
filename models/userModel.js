const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the user name"],
    },
    email: {
      type: String,
      required: [true, "Please add the user email address"],
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
    roles: [{
      resource: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'roles.resourceType',
        required: true
      },
      resourceType: {
        type: String,
        required: true,
        enum: ['Workspace', 'Folder', 'Document'] // Add other resource types as needed
      },
      role: {
        type: String,
        enum: ['owner', 'editor', 'viewer']
      },
      permissions: {
        type: [String]
      },

    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);