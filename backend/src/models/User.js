class User {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.isVerified = data.isVerified || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      id: doc.id,
      ...data
    });
  }

  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      password: this.password,
      role: this.role,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;