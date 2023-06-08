const mongoose = require("mongoose");

const documentSchema = mongoose.Schema(

    {
        name: {
            type: String
        },
        parentWorkspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace"
        },
        parentFolder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder"
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Document", documentSchema);
