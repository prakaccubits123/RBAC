const asyncHandler = require("express-async-handler");
const Workspace = require('../models/workspaceModel');
const User = require('../models/userModel');

// const { hasViewPermission, hasEditPermission, checkOwner } = require("../middleware/roleHandler");

const createWorkspace = asyncHandler(async (req, res) => {

    const newWorkspace = await Workspace.create(req.body)
    const userRole = {
        role: 'owner',
        permissions: ['edit', 'view', 'delete', 'share'],
        resource: newWorkspace._id,
        resourceType: 'Workspace',
    }
    const user = await User.findById(req.user.id)
    user.roles.push(userRole)
    await user.save()
    res.send(newWorkspace)
});

const getWorkspace = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.workspaceId);
    res.send(workspace)
});

const getWorkspaces = asyncHandler(async (req, res) => {
    const userId = req.user.id; // Assuming you have the user ID stored in req.user.id

    try {
        // Find the user with roles
        const user = await User.findById(userId).populate({
            path: 'roles',
            populate: {
                path: 'resource'
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract workspaces where the user has the "view" permission
        const workspaces = user.roles
            .filter(role => role.resourceType === 'Workspace' && role.permissions.includes('view'))
            .map(role => role.resource);

        res.json(workspaces);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

const shareEditorRole = async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const { userId } = req.body; // Assuming you have the user ID to share the role and permissions with

    try {
        // Find the workspace by ID
        const workspace = await Workspace.findById(workspaceId);

        // Create a new role for the user to be shared with
        const userRole = {
            role: 'editor',
            permissions: ['edit', 'view', 'share'],
            resource: workspace._id,
            resourceType: 'Workspace',
        }
        const user = await User.findById(userId)
        user.roles.push(userRole)
        await user.save()

        res.json({ message: "Editor role shared successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



module.exports = { createWorkspace, getWorkspace, getWorkspaces, shareEditorRole };