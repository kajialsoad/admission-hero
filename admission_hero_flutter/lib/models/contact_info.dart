class ContactInfo {
  final String email;
  final String phone;
  final String workingHours;

  ContactInfo({
    required this.email,
    required this.phone,
    required this.workingHours,
  });

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      email: json['email'] ?? 'support.admissionhero@gmail.com',
      phone: json['phone'] ?? '+880 1575804161',
      workingHours: json['workingHours'] ?? 'Available from 10:00 AM to 10:00 PM',
    );
  }

  // Default values
  static ContactInfo get defaultInfo => ContactInfo(
    email: 'support.admissionhero@gmail.com',
    phone: '+880 1575804161',
    workingHours: 'Available from 10:00 AM to 10:00 PM',
  );
}
