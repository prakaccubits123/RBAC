const asyncHandler = require("express-async-handler");
const Folder = require('../models/folderModel');
const User = require('../models/userModel');

const createFolder = asyncHandler(async (req, res) => {
    let folder;
    if (req.body.folderId) {
        data = {
            name: req.body.name,
            parentFolder: req.body.folderId
        }
        folder = await Folder.create(data)

    } else {
        data = {
            name: req.body.name,
            parentWorkspace: req.body.workspaceId
        }
        folder = await Folder.create(data)
    }
    const userRole = {
        role: 'owner',
        permissions: ['edit', 'view', 'delete', 'share'],
        resource: folder._id,
        resourceType: 'Folder',
    }
    const user = await User.findById(req.user.id)
    user.roles.push(userRole)
    await user.save()
    res.send(folder)
});

const getFolder = asyncHandler(async (req, res) => {
    const folders = await Folder.findById(req.params.folderId);

    res.send(folders)
});

const deleteFolder = asyncHandler(async (req, res) => {
    const folders = await Folder.findByIdAndRemove(req.params.folderId);

    res.send(folders)
});

const getFolders = asyncHandler(async (req, res) => {
    const userId = req.user.id; // Assuming you have the user ID stored in req.user.id
    console.log(userId)
    try {
        // Find the user with roles
        const user = await User.findById(userId).populate({
            path: 'roles',
            populate: {
                path: 'resource'
            }
        });
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract workspaces where the user has the "view" permission
        const folders = user.roles
            .filter(role => role.resourceType === 'Folder' && role.permissions.includes('view'))
            .map(role => role.resource);

        console.log(folders);

        res.json(folders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});



const shareViewerRole = async (req, res) => {
    const folderId = req.params.folderId;
    const { userId } = req.body; // Assuming you have the user ID to share the role and permissions with

    try {
        // Find the workspace by ID
        const folder = await Folder.findById(folderId);

        // Create a new role for the user to be shared with
        const userRole = {
            role: 'viewer',
            permissions: ['view'],
            resource: folder._id,
            resourceType: 'Folder',
        }

        const user = await User.findById(userId)
        user.roles.push(userRole)
        await user.save()

        res.json({ message: "Viewer role shared successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { createFolder, getFolder, getFolders, shareViewerRole, deleteFolder };