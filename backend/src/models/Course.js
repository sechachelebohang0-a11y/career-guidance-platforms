class Course {
  constructor(data) {
    this.id = data.id;
    this.institutionId = data.institutionId;
    this.name = data.name;
    this.description = data.description;
    this.faculty = data.faculty;
    this.duration = data.duration;
    this.requirements = data.requirements || [];
    this.seats = data.seats;
    this.availableSeats = data.availableSeats || data.seats;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Course({
      id: doc.id,
      ...data
    });
  }

  toFirestore() {
    return {
      id: this.id,
      institutionId: this.institutionId,
      name: this.name,
      description: this.description,
      faculty: this.faculty,
      duration: this.duration,
      requirements: this.requirements,
      seats: this.seats,
      availableSeats: this.availableSeats,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

module.exports = Course;