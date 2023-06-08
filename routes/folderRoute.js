const express = require("express");
const {
    createFolder,
    getFolder,
    shareViewerRole,
    getFolders,
    deleteFolder
} = require("../controllers/folderController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

const { createFolderPermission, viewFolderPermission, editFolderPermission, deleteFolderPermission } = require('../middleware/roleHandler')

router.post("/create", validateToken, createFolderPermission('edit'), createFolder);
router.get("/get/:folderId", validateToken, viewFolderPermission('view'), getFolder);
router.patch("/edit/:folderId", validateToken, editFolderPermission('edit'), getFolder);
router.delete("/delete/:folderId", validateToken, deleteFolderPermission('delete'), deleteFolder);

router.post("/share/viewPermission/:folderId", validateToken, editFolderPermission('edit'), shareViewerRole);


router.get("/", validateToken, getFolders)

module.exports = router;
