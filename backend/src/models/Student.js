class Student {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phone = data.phone;
    this.address = data.address;
    this.dateOfBirth = data.dateOfBirth;
    this.qualifications = data.qualifications || [];
    this.applications = data.applications || [];
    this.transcripts = data.transcripts || [];
    this.certificates = data.certificates || [];
    this.workExperience = data.workExperience || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Student({
      id: doc.id,
      ...data
    });
  }

  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      address: this.address,
      dateOfBirth: this.dateOfBirth,
      qualifications: this.qualifications,
      applications: this.applications,
      transcripts: this.transcripts,
      certificates: this.certificates,
      workExperience: this.workExperience,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Student;