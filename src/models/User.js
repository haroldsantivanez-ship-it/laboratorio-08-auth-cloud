import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        birthdate: {
            type: Date,
            required: true,
            validate: {
                validator: (value) => value <= new Date(),
                message: "La fecha de nacimiento no puede ser futura."
            }
        },
        url_profile: {
            type: String,
            default: "",
            trim: true
        },
        address: {
            type: String,
            default: "",
            trim: true
        },
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

userSchema.virtual("age").get(function () {
    if (!this.birthdate) return null;

    const today = new Date();
    const birth = this.birthdate;

    let age = today.getUTCFullYear() - birth.getUTCFullYear();

    const birthdayPending =
        today.getUTCMonth() < birth.getUTCMonth() ||
        (today.getUTCMonth() === birth.getUTCMonth() &&
            today.getUTCDate() < birth.getUTCDate());

    if (birthdayPending) age--;

    return age;
});

export default mongoose.model("User", userSchema);