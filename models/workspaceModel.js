const mongoose = require("mongoose");

const workspaceSchema = mongoose.Schema(
    {
        name: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Workspace", workspaceSchema);
