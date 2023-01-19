"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorFood = exports.GetAllVendors = exports.updateVendorProfile = exports.deleteFood = exports.VendorProfile = exports.createFood = exports.vendorLogin = void 0;
const utils_1 = require("../utils");
const uuid_1 = require("uuid");
const vendorModel_1 = require("../model/vendorModel");
const foodModel_1 = require("../model/foodModel");
/** ======================= Vendor Login ========================  **/
const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validateResult = utils_1.loginSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        //check if vendor exist
        const Vendor = await vendorModel_1.VendorInstance.findOne({ where: { email: email } });
        if (Vendor) {
            const validation = await (0, utils_1.validatePassword)(password, Vendor.password, Vendor.salt);
            if (validation) {
                // Generate signature for vendor
                let signature = await (0, utils_1.Generatesignature)({
                    id: Vendor.id,
                    email: Vendor.email,
                    serviceAvailable: Vendor.serviceAvailable
                });
                return res.status(200).json({
                    message: "You have Successfully logged In",
                    signature,
                    email: Vendor.email,
                    serviceAvailable: Vendor.serviceAvailable,
                    role: Vendor.role,
                });
            }
        }
        return res.status(400).json({
            Error: "Wrong Username or password"
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/login"
        });
    }
};
exports.vendorLogin = vendorLogin;
/** ======================= Vendor Add Food ========================  **/
const createFood = async (req, res) => {
    try {
        const id = req.vendor.id;
        const foodid = (0, uuid_1.v4)();
        const { name, description, category, foodType, readyTime, price, image } = req.body;
        //check if vendor exist
        const Vendor = await vendorModel_1.VendorInstance.findOne({ where: { id: id } });
        if (Vendor) {
            console.log("hello");
            const createfood = await foodModel_1.FoodInstance.create({
                id: foodid,
                name,
                description,
                category,
                foodType,
                readyTime,
                price,
                rating: 0,
                vendorId: id,
                image: req.file.path
            });
            console.log(createfood);
            return res.status(201).json({
                message: "Food added successfully",
                createfood
            });
        }
        return res.status(400).json({
            message: "unauthorised",
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/create-food",
        });
    }
};
exports.createFood = createFood;
/** =========================== GET VENDOR PROFILE =================================== */
const VendorProfile = async (req, res) => {
    try {
        const id = req.vendor.id;
        //check if vendor exist
        const Vendor = await vendorModel_1.VendorInstance.findOne({
            where: { id: id },
            include: [
                {
                    model: foodModel_1.FoodInstance,
                    as: 'food',
                    attributes: ["id", "name", "description", "category", "foodType", "readyTime", "image", "price", "rating", "vendorId"]
                }
            ]
        });
        return res.status(200).json({
            Vendor
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/get-profile"
        });
    }
};
exports.VendorProfile = VendorProfile;
/** =========================== VENDOR DELETE FOOD =================================== */
const deleteFood = async (req, res) => {
    try {
        const id = req.vendor.id;
        const foodid = req.params.foodid;
        //check if vendor exist
        const Vendor = await vendorModel_1.VendorInstance.findOne({ where: { id: id } });
        if (Vendor) {
            const deleteFood = await foodModel_1.FoodInstance.destroy({ where: { id: foodid } });
            return res.status(200).json({
                message: "Food has been deleted",
                deleteFood
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/delete-food"
        });
    }
};
exports.deleteFood = deleteFood;
/** =========================== VENDOR Update =================================== */
const updateVendorProfile = async (req, res) => {
    try {
        const id = req.vendor.id;
        const { name, phone, address, coverImage } = req.body;
        const validateResult = utils_1.updateVendorSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        const User = await vendorModel_1.VendorInstance.findOne({ where: { id: id } });
        if (!User) {
            return res.status(400).json({
                Error: "Not authorised to upfate your profile"
            });
        }
        const updatedUser = await vendorModel_1.VendorInstance.update({
            name, phone, address, coverImage: req.file.path
        }, { where: { id: id } });
        if (updatedUser) {
            return res.status(200).json({
                message: "You have successfully updated your profile",
                User
            });
        }
        return res.status(400).json({
            message: "Error updating your profile"
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/update-profile"
        });
    }
};
exports.updateVendorProfile = updateVendorProfile;
/** =========================== GET VENDOR Food =================================== */
const GetAllVendors = async (req, res) => {
    try {
        const Vendor = await vendorModel_1.VendorInstance.findAndCountAll({});
        return res.status(200).json({
            message: "You have successfully retrieved all users",
            count: Vendor.count,
            vendor: Vendor.rows
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/Vendor/get-all-users"
        });
    }
};
exports.GetAllVendors = GetAllVendors;
const getVendorFood = async (req, res) => {
    try {
        const id = req.params.id;
        //check if vendor exist
        const Vendor = await vendorModel_1.VendorInstance.findOne({
            where: { id: id },
            include: [
                {
                    model: foodModel_1.FoodInstance,
                    as: 'food',
                    attributes: ["id", "name", "description", "category", "foodType", "readyTime", "image", "price", "rating", "vendorId"]
                }
            ]
        });
        return res.status(200).json({
            Vendor
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/get-profile"
        });
    }
};
exports.getVendorFood = getVendorFood;
