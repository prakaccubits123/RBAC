const express = require("express");
const {
    createWorkspace,
    getWorkspace,
    // editWorkspace,
    getWorkspaces,
    shareEditorRole,

    // shareWorkpaceEditorAccess,
    // shareWorkpaceViewerAccess
} = require("../controllers/workspaceController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
const { checkWorkspaceAccess } = require('../middleware/roleHandler')
router.post("/create", validateToken, createWorkspace);

router.get("/get/:workspaceId", validateToken, checkWorkspaceAccess('view'), getWorkspace);

router.post("/share/editPermission/:workspaceId", validateToken, checkWorkspaceAccess('edit'), shareEditorRole);

// router.post("/share/view/:id", validateToken, shareWorkpaceViewerAccess);

router.get("/", validateToken, getWorkspaces)

module.exports = router;
