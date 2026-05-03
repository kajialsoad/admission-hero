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
      email: json['email'] ?? 'support@admission-hero.com',
      phone: json['phone'] ?? '+880 1234 567890',
      workingHours: json['workingHours'] ?? 'Mon-Sat, 9 AM - 6 PM',
    );
  }

  // Default values
  static ContactInfo get defaultInfo => ContactInfo(
    email: 'support@admission-hero.com',
    phone: '+880 1234 567890',
    workingHours: 'Mon-Sat, 9 AM - 6 PM',
  );
}
