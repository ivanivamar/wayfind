class Place {
  final String id;
  final String name;
  final String sub;
  final String icon;
  final String dist;
  final String? type;

  const Place({
    required this.id,
    required this.name,
    required this.sub,
    required this.icon,
    required this.dist,
    this.type,
  });

  bool get isFavoriteIcon =>
      icon == 'home' || icon == 'brief' || icon == 'heart' || icon == 'star';
}
