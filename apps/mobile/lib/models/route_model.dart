class RouteLeg {
  final String mode;
  final String label;
  final String? sub;

  const RouteLeg({required this.mode, required this.label, this.sub});
}

class RouteStep {
  final String icon;
  final String text;
  final String dur;
  final String? sub;
  final String? line;
  final String? lineColor;
  final List<String>? stops;

  const RouteStep({
    required this.icon,
    required this.text,
    required this.dur,
    this.sub,
    this.line,
    this.lineColor,
    this.stops,
  });
}

class WfRoute {
  final int id;
  final String duration;
  final String arrive;
  final String tag;
  final String tagColor;
  final List<RouteLeg> legs;
  final int transfers;
  final String dist;
  final String status;
  final bool statusOk;
  final String co2;
  final String fare;
  final List<RouteStep> steps;

  const WfRoute({
    required this.id,
    required this.duration,
    required this.arrive,
    required this.tag,
    required this.tagColor,
    required this.legs,
    required this.transfers,
    required this.dist,
    required this.status,
    required this.statusOk,
    required this.co2,
    required this.fare,
    required this.steps,
  });
}
