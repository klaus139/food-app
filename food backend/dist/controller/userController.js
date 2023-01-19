"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getSingleUser = exports.getAllUsers = exports.resendOTP = exports.Login = exports.verifyUser = exports.Register = void 0;
const utils_1 = require("../utils");
const config_1 = require("../config");
const userModel_1 = require("../model/userModel");
const uuid_1 = require("uuid");
const Register = async (req, res, next) => {
    try {
        const { email, phone, password, confirm_password } = req.body;
        const uuidUser = (0, uuid_1.v4)();
        const validateResult = utils_1.registerSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            console.log(validateResult.error);
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        //Generate Salt
        const salt = await (0, utils_1.GenerateSalt)();
        const userPassword = await (0, utils_1.GeneratePassword)(password, salt);
        //Generate OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        //check if the user exist
        const User = await userModel_1.UserInstance.findOne({ where: { email: email } });
        if (!User) {
            await userModel_1.UserInstance.create({
                id: uuidUser,
                email,
                password: userPassword,
                firstName: '',
                lastName: '',
                salt,
                address: '',
                phone,
                otp,
                otp_expiry: expiry,
                lng: 0,
                lat: 0,
                verified: false,
                role: 'user'
            });
            //Send OTP to user
            // await onRequestOTP(otp, phone)
            //send mail to users
            const html = (0, utils_1.emailHtml)(otp);
            await (0, utils_1.sendmail)(config_1.fromAdminMail, email, config_1.userSubject, html);
            //check if the user exist
            const User = await userModel_1.UserInstance.findOne({ where: { email: email } });
            //Generate signature from user
            const signature = await (0, utils_1.Generatesignature)({
                id: User.id,
                email: User.email,
                verified: User.verified
            });
            return res.status(201).json({
                message: 'User Created Successfully check your email or phone for OTP verification',
                signature,
                verified: User.verified,
            });
        }
        return res.status(400).json({
            message: 'User Already Exist'
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/users/signup"
        });
    }
};
exports.Register = Register;
/** ======================= Verify Users ========================  **/
const verifyUser = async (req, res) => {
    try {
        const token = req.params.signature;
        const decode = await (0, utils_1.verifySignature)(token);
        console.log(decode);
        //check if the user is a registered user
        const User = await userModel_1.UserInstance.findOne({ where: { email: decode.email } });
        if (User) {
            const { otp } = req.body;
            if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
                const updatedUser = await userModel_1.UserInstance.update({
                    verified: true
                }, { where: { email: decode.email } });
                //Generate a new Signature
                const signature = await (0, utils_1.Generatesignature)({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    verified: updatedUser.verified
                });
                return res.status(200).json({
                    message: 'User Verified Successfully',
                    signature,
                    verified: User.verified,
                    role: User.role
                });
            }
            return res.status(400).json({
                Error: 'OTP is invalid or expired'
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/users/verify"
        });
    }
};
exports.verifyUser = verifyUser;
/** ======================= Login ========================  **/
const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const validateResult = utils_1.loginSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        //check if user exist
        const User = await userModel_1.UserInstance.findOne({ where: { email: email } });
        console.log(User);
        if (User.verified) {
            const validation = await (0, utils_1.validatePassword)(password, User.password, User.salt);
            if (validation) {
                let signature = await (0, utils_1.Generatesignature)({
                    id: User.id,
                    email: User.email,
                    verified: User.verified,
                });
                console.log("hello");
                return res.status(200).json({
                    message: "You have Successfully logged In",
                    signature,
                    email: User.email,
                    verified: User.verified,
                    role: User.role
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
            route: "/users/login"
        });
    }
};
exports.Login = Login;
/** ======================= Resend OTP ========================  **/
const resendOTP = async (req, res) => {
    try {
        const token = req.params.signature;
        const decode = await (0, utils_1.verifySignature)(token);
        console.log(decode);
        //check if user exist
        const User = await userModel_1.UserInstance.findOne({ where: { email: decode.email } });
        //Generate OTP
        if (User) {
            const { otp, expiry } = (0, utils_1.GenerateOTP)();
            const updatedUser = await userModel_1.UserInstance.update({
                otp,
                otp_expiry: expiry
            }, { where: { email: decode.email } });
            if (updatedUser) {
                const User = await userModel_1.UserInstance.findOne({ where: { email: decode.email } });
                //Send Otp to user
                await (0, utils_1.onRequestOTP)(otp, User.phone);
                //send Mail to user
                const html = (0, utils_1.emailHtml)(otp);
                await (0, utils_1.sendmail)(config_1.fromAdminMail, User.email, config_1.userSubject, html);
                return res.status(200).json({
                    message: "OTP resent to phone number and email",
                });
            }
        }
        return res.status(400).json({
            message: "Error Sending OTP",
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/users/resend-otp/:signature"
        });
    }
};
exports.resendOTP = resendOTP;
/** ======================= PROFILE ========================  **/
const getAllUsers = async (req, res) => {
    try {
        const limit = req.query.limit;
        const users = await userModel_1.UserInstance.findAndCountAll({
            limit: limit
        });
        return res.status(200).json({
            message: "You have successfully retrieved all users",
            count: users.count,
            users: users.rows
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/users/get-all-users"
        });
    }
};
exports.getAllUsers = getAllUsers;
const getSingleUser = async (req, res) => {
    try {
        const id = req.user.id;
        // find the user by id
        const User = await userModel_1.UserInstance.findOne({ where: { id: id } });
        if (User) {
            return res.status(200).json({
                User
            });
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/users/get-user"
        });
    }
};
exports.getSingleUser = getSingleUser;
const updateUserProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const { firstName, lastName, address, phone } = req.body;
        const validateResult = utils_1.updateSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            });
        }
        const User = await userModel_1.UserInstance.findOne({ where: { id: id } });
        if (!User) {
            return res.status(400).json({
                Error: "Not authorised to upfate your profile"
            });
        }
        const updatedUser = await userModel_1.UserInstance.update({
            firstName, lastName, address, phone
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
            route: "/users/update-profile"
        });
    }
};
exports.updateUserProfile = updateUserProfile;
//forgot password
