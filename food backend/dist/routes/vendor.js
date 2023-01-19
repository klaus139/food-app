"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendorController_1 = require("../controller/vendorController");
const authorization_1 = require("../middleware/authorization");
const multer_1 = require("../utils/multer");
const router = express_1.default.Router();
router.post('/login', vendorController_1.vendorLogin);
router.post('/create-food', authorization_1.authVendor, multer_1.upload.single('image'), vendorController_1.createFood);
router.get('/get-profile', authorization_1.authVendor, vendorController_1.VendorProfile);
router.delete('/delete-food/:foodid', authorization_1.authVendor, vendorController_1.deleteFood);
router.patch('/update-profile', authorization_1.authVendor, multer_1.upload.single('coverImage'), vendorController_1.updateVendorProfile);
router.get('/get-all-vendors', vendorController_1.GetAllVendors);
router.get('/get-vendor-food/:id', vendorController_1.getVendorFood);
exports.default = router;
