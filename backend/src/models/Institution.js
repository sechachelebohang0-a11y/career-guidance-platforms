class Institution {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email;
    this.name = data.name;
    this.address = data.address;
    this.phone = data.phone;
    this.website = data.website;
    this.description = data.description;
    this.isApproved = data.isApproved || false;
    this.faculties = data.faculties || [];
    this.courses = data.courses || [];
    this.applications = data.applications || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Institution({
      id: doc.id,
      ...data
    });
  }

  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      name: this.name,
      address: this.address,
      phone: this.phone,
      website: this.website,
      description: this.description,
      isApproved: this.isApproved,
      faculties: this.faculties,
      courses: this.courses,
      applications: this.applications,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Institution;