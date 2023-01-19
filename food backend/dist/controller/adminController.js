"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendor = exports.superAdmin = exports.AdminRegister = void 0;
const utils_1 = require("../utils");
const userModel_1 = require("../model/userModel");
const uuid_1 = require("uuid");
const vendorModel_1 = require("../model/vendorModel");
const AdminRegister = async (req, res, next) => {
    try {
        const id = req.user.id;
        const { email, firstName, lastName, address, phone, password } = req.body;
        const uuidUser = (0, uuid_1.v4)();
        const validateResult = utils_1.adminSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            console.log(validateResult.error);
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        //Generate Salt
        const salt = await (0, utils_1.GenerateSalt)();
        const adminPassword = await (0, utils_1.GeneratePassword)(password, salt);
        //Generate OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        //check if the Admin exist
        const Admin = await userModel_1.UserInstance.findOne({ where: { id: id } });
        // if(Admin.email === email){
        //     return res.status(400).json({
        //         message: "Email already exist",
        //     })
        // }
        if (Admin.role === "superadmin") {
            const User = await userModel_1.UserInstance.findOne({ where: { email: email } });
            if (!User) {
                const newAdmin = await userModel_1.UserInstance.create({
                    id: uuidUser,
                    email,
                    password: adminPassword,
                    firstName: '',
                    lastName: '',
                    salt,
                    address: '',
                    phone,
                    otp,
                    otp_expiry: expiry,
                    lng: 0,
                    lat: 0,
                    verified: true,
                    role: 'admin',
                });
                //Send OTP to user
                // await onRequestOTP(otp, phone)
                //send mail to users
                // const html =  emailHtml(otp)
                // await sendmail(fromAdminMail, email, userSubject, html);
                //check if the admin exist
                //const Admin = await UserInstance.findOne({where:{id:id}})as unknown as UserAttributes
                //Generate signature from user
                const signature = await (0, utils_1.Generatesignature)({
                    id: newAdmin.id,
                    email: newAdmin.email,
                    verified: newAdmin.verified
                });
                return res.status(201).json({
                    message: 'Admin Created Successfully',
                    signature,
                    verified: newAdmin.verified,
                    role: newAdmin.role,
                    password
                });
            }
            return res.status(400).json({
                message: 'Admin Already Exist'
            });
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/admins/create-admin"
        });
    }
};
exports.AdminRegister = AdminRegister;
const superAdmin = async (req, res) => {
    try {
        const { email, phone, password, firstName, lastName, address } = req.body;
        const uuiduser = (0, uuid_1.v4)();
        const validateResult = utils_1.adminSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        //generate salt
        const salt = await (0, utils_1.GenerateSalt)();
        const adminPassword = await (0, utils_1.GeneratePassword)(password, salt);
        // //generate OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        // //check if the admin exist
        const Admin = (await userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        // create Admin
        if (!Admin) {
            await userModel_1.UserInstance.create({
                id: uuiduser,
                email,
                password: adminPassword,
                firstName,
                lastName,
                salt,
                address,
                phone,
                otp,
                otp_expiry: expiry,
                lng: 0,
                lat: 0,
                verified: true,
                role: "superadmin"
            });
            //check if the admin exist
            const Admin = (await userModel_1.UserInstance.findOne({
                where: { email: email },
            }));
            //Generate a signature
            let signature = await (0, utils_1.Generatesignature)({
                id: Admin.id,
                email: Admin.email,
                verified: Admin.verified,
            });
            return res.status(201).json({
                message: "admin created successfully",
                signature,
                verified: Admin.verified,
                role: Admin.role
            });
        }
        return res.status(400).json({
            message: "admin already exist",
        });
    }
    catch (err) {
        ///console.log(err.name)
        console.log(err.message);
        // console.log(err.stack)
        res.status(500).json({
            Error: "Internal server Error",
            route: "/admins/create-super-admin",
        });
    }
};
exports.superAdmin = superAdmin;
/** ======================= Create Vendor ========================  **/
const createVendor = async (req, res) => {
    try {
        const { name, restaurantName, pincode, phone, address, email, password } = req.body;
        const id = req.user.id;
        const uuidVendor = (0, uuid_1.v4)();
        const validateResult = utils_1.vendorSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        //generate salt
        const salt = await (0, utils_1.GenerateSalt)();
        const vendorPassword = await (0, utils_1.GeneratePassword)(password, salt);
        //check if the vendor exist
        const Vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { email: email },
        }));
        const Admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (Admin.role === 'admin' || Admin.role === 'superadmin') {
            if (!Vendor) {
                const createVendor = await vendorModel_1.VendorInstance.create({
                    id: uuidVendor,
                    email,
                    password: vendorPassword,
                    name,
                    restaurantName,
                    salt,
                    address,
                    phone,
                    pincode,
                    serviceAvailable: false,
                    role: "vendor",
                    rating: 0,
                    coverImage: '',
                });
                return res.status(201).json({
                    message: "Vendor created successfully",
                    createVendor
                });
            }
            return res.status(400).json({
                message: "Vendor already exist",
            });
        }
        return res.status(400).json({
            message: "unauthorised",
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/admins/create-vendors",
        });
    }
};
exports.createVendor = createVendor;
