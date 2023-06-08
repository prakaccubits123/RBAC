const Workspace = require('../models/workspaceModel');
const Folder = require('../models/folderModel');
const User = require('../models/userModel');
const mongoose = require('mongoose')


const checkWorkspaceAccess = (requiredPermissions) => {
    return async (req, res, next) => {
        const workspaceId = req.params.workspaceId || req.body.workspaceId;
        const userId = req.user.id;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(workspaceId)
        // Find the workspace
        const workspace = user.roles.find(role => role.resourceType === "Workspace" && role.resource.toString() === workspaceId);
        if (!workspace) {
            return res.status(403).json({ message: "You are not allowed to access this workspace" });
        }

        // Check if the user has the required role and permission
        if (workspace.role !== "owner" && workspace.role !== "editor" && workspace.role !== "viewer") {
            return res.status(403).json({ message: "You are not allowed to perform this operation" });
        }

        if (!workspace.permissions.includes(requiredPermissions)) {
            return res.status(403).json({ message: "Insufficient permissions" });

        }
        // Pass the workspace to the next middleware or controller
        req.workspace = workspace;
        next();
    };
};

const createFolderPermission = (permission) => {
    return async (req, res, next) => {
        const workspaceId = req.body.workspaceId
        const folderId = req.body.folderId || req.params.folderId
        const userId = req.user.id;
        const user = await User.findById(userId)
        if (workspaceId) {
            const workspaceIdObject = mongoose.Types.ObjectId(workspaceId);
            const workspace1 = await Workspace.findById(workspaceIdObject);
            if (!workspace1) {
                return res
                    .status(403)
                    .json({ message: "Workspace not found" });
            }
            const workspace = user.roles.find(role => role.resourceType === "Workspace" && role.resource.toString() === workspaceId.toString());
            if ((workspace.role === "owner" || workspace.role === "editor") && workspace.permissions.includes(permission)) {
                next()
            }
        } else if (folderId) {

            const hasEditPermission = await checkFolderPermissions(folderId, userId, permission);

            if (hasEditPermission) {
                next();
            } else {
                return res
                    .status(403)
                    .json({ message: "You are not allowed to create a folder in this folder" });
            }

        } else {
            return res.status(400).json({ message: "Invalid request" });
        }

    }
}

const checkWorkspacePermissions = async (workspaceId, userId, requiredPermissions) => {
    const user = await User.findById(userId);
    const workspaceRole = user.roles.find(
        (role) =>
            role.resourceType === "Workspace" &&
            role.resource.toString() === workspaceId.toString()
    );

    if (
        workspaceRole &&
        workspaceRole.permissions.includes(requiredPermissions)
    ) {
        return true;
    }

    return false;
};

const checkFolderPermissions = async (folderId, userId, permission) => {
    const folder = await Folder.findById(folderId).populate("parentFolder parentWorkspace");
    if (!folder) {
        return false;
    }

    const user = await User.findById(userId);
    const folderRole = user.roles.find(role => role.resourceType === "Folder" && role.resource.toString() === folderId.toString());
    if (folderRole && folderRole.permissions.includes(permission)) {
        return true;
    }

    if (folder.parentFolder) {
        return checkFolderPermissions(folder.parentFolder._id, userId, permission);
    } else if (folder.parentWorkspace) {
        return checkWorkspacePermissions(folder.parentWorkspace._id, userId, permission);
    }

    return false;
};

const viewFolderPermission = (permission) => {
    return async (req, res, next) => {
        const folderId = req.params.folderId
        const userId = req.user.id;
        const hasViewPermission = await checkFolderPermissions(folderId, userId, permission);
        if (hasViewPermission) {
            next();
        } else {
            return res
                .status(403)
                .json({ message: "You are not allowed to view this folder" });
        }
    }
}

const deleteFolderPermission = (permission) => {
    return async (req, res, next) => {
        const folderId = req.params.folderId
        const userId = req.user.id;
        const hasDeletePermission = await checkFolderDeletePermissions(folderId, userId, permission);
        if (hasDeletePermission) {
            next();
        } else {
            return res
                .status(403)
                .json({ message: "You are not allowed to delete this folder" });
        }
    }
}

const checkFolderDeletePermissions = async (folderId, userId, permission) => {
    const folder = await Folder.findById(folderId).populate("parentFolder parentWorkspace");
    if (!folder) {
        return false;
    }

    const user = await User.findById(userId);
    const folderRole = user.roles.find(role => role.resourceType === "Folder" && role.resource.toString() === folderId.toString());
    if (folderRole.role === 'owner' && folderRole.permissions.includes(permission)) {
        return true;
    }

    if (folder.parentFolder) {
        return checkFolderDeletePermissions(folder.parentFolder._id, userId, permission);
    } else if (folder.parentWorkspace) {
        return checkWorkspaceFolderDeletePermission(folder.parentWorkspace._id, userId, permission);
    }

    return false;
};

const editFolderPermission = (permission) => {
    return async (req, res, next) => {
        const folderId = req.params.folderId
        const userId = req.user.id;
        const hasEditPermission = await checkFolderPermissions(folderId, userId, permission);
        if (hasEditPermission) {
            next();
        } else {
            return res
                .status(403)
                .json({ message: "You are not allow to do this operation" });
        }
    }
}

const checkWorkspaceFolderDeletePermission = async (workspaceId, userId, requiredPermissions) => {
    const user = await User.findById(userId);
    const workspaceRole = user.roles.find(
        (role) =>
            role.resourceType === "Workspace" &&
            role.resource.toString() === workspaceId.toString()
    );

    if (workspaceRole &&
        (workspaceRole.role === 'owner' &&
            workspaceRole.permissions.includes(requiredPermissions))
    ) {
        return true;
    }

    return false;
};

module.exports = { checkWorkspaceAccess, createFolderPermission, viewFolderPermission, editFolderPermission, deleteFolderPermission };