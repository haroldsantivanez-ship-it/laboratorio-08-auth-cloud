import User from "../models/User.js";

class UserRepository {
    create(data) {
        return User.create(data);
    }

    findByEmail(email) {
        return User.findOne({ email }).populate("roles");
    }

    findForLogin(email) {
        return User.findOne({ email })
            .select("+password")
            .populate("roles");
    }

    findById(id) {
        return User.findById(id).populate("roles");
    }

    getAll() {
        return User.find()
            .populate("roles")
            .sort({ createdAt: -1 });
    }

    updateProfile(id, data) {
        return User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).populate("roles");
    }

    updatePassword(id, passwordHash) {
        return User.findByIdAndUpdate(
            id,
            { $set: { password: passwordHash } },
            { new: true, runValidators: true }
        );
    }
}

export default new UserRepository();