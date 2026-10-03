import Role from "../models/Role.js";

class RoleRepository {
    findByName(name) {
        return Role.findOne({ name });
    }

    create(data) {
        return Role.create(data);
    }

    getAll() {
        return Role.find();
    }
}

export default new RoleRepository();