import '../models/place.dart';
import '../models/route_model.dart';

const wfUser = (
  name: 'Alex Martin',
  email: 'alex.martin@example.com',
  initials: 'AM',
);

const wfFavorites = [
  Place(id: 'home', name: 'Home', sub: 'Rue Oberkampf 24, 75011 Paris', icon: 'home', dist: '0 km'),
  Place(id: 'work', name: 'Work', sub: 'Rue du Louvre 12, 75001 Paris', icon: 'brief', dist: '2.4 km'),
  Place(id: 'gym', name: 'Climbing gym', sub: 'Arkose Nation · 11th arr.', icon: 'heart', dist: '1.6 km'),
  Place(id: 'cafe', name: 'Café Loustic', sub: 'Rue Chapon 40, 75003 Paris', icon: 'star', dist: '1.1 km'),
  Place(id: 'mom', name: "Mom's place", sub: 'Rue de Belleville 88', icon: 'heart', dist: '3.2 km'),
];

const wfRecents = [
  Place(id: 'r1', name: 'Gare du Nord', sub: 'Train station · RER B/D', icon: 'transit', dist: '1.2 km', type: 'transit'),
  Place(id: 'r2', name: 'Musée du Louvre', sub: 'Museum · 1st arr.', icon: 'pin', dist: '1.9 km', type: 'place'),
  Place(id: 'r3', name: 'République', sub: 'Square · 11th arr.', icon: 'pin', dist: '0.6 km', type: 'place'),
];

const wfSuggestions = [
  Place(id: 's1', name: 'Gare du Nord', sub: 'Train station · Metro 4/5 · RER B/D', icon: 'transit', dist: '1.2 km', type: 'transit'),
  Place(id: 's2', name: 'Gare de Lyon', sub: 'Train station · Metro 1/14', icon: 'transit', dist: '2.8 km', type: 'transit'),
  Place(id: 's3', name: 'Galerie Lafayette', sub: 'Department store · 9th arr.', icon: 'pin', dist: '1.6 km', type: 'place'),
  Place(id: 's4', name: 'Gare Montparnasse', sub: 'Train station · Metro 4/6/12/13', icon: 'transit', dist: '4.1 km', type: 'transit'),
];

const wfRoutes = [
  WfRoute(
    id: 1,
    duration: '14 min',
    arrive: '14:47',
    tag: 'Fastest',
    tagColor: 'terra',
    legs: [
      RouteLeg(mode: 'walk', label: '5 min'),
      RouteLeg(mode: 'bus', label: '42', sub: '3 stops'),
      RouteLeg(mode: 'walk', label: '2 min'),
    ],
    transfers: 1,
    dist: '1.4 km',
    status: 'On time',
    statusOk: true,
    co2: '0.4 kg',
    fare: '€2.10',
    steps: [
      RouteStep(icon: 'walk', text: 'Walk south on Rue Oberkampf', dur: '5 min', sub: '400 m'),
      RouteStep(
        icon: 'bus',
        text: 'Bus 42 toward Gare du Nord',
        dur: '8 min',
        sub: 'Departs 14:34 · Platform A',
        line: '42',
        lineColor: 'bus',
        stops: ['Filles du Calvaire', 'Temple', 'Arts et Métiers', 'République', 'Gare du Nord'],
      ),
      RouteStep(icon: 'walk', text: 'Walk to Louvre — Rivoli', dur: '2 min', sub: '160 m'),
    ],
  ),
  WfRoute(
    id: 2,
    duration: '19 min',
    arrive: '14:52',
    tag: 'Fewer transfers',
    tagColor: 'green',
    legs: [
      RouteLeg(mode: 'walk', label: '3 min'),
      RouteLeg(mode: 'train', label: 'M5', sub: '5 stops'),
      RouteLeg(mode: 'walk', label: '4 min'),
    ],
    transfers: 0,
    dist: '2.1 km',
    status: '2 min delay',
    statusOk: false,
    co2: '0.3 kg',
    fare: '€2.10',
    steps: [
      RouteStep(icon: 'walk', text: 'Walk to Oberkampf station', dur: '3 min', sub: '250 m'),
      RouteStep(
        icon: 'train',
        text: 'Metro line 5 toward Bobigny',
        dur: '12 min',
        sub: 'Departs 14:36 · 5 stops',
        line: '5',
        lineColor: 'train',
        stops: ['Filles du Calvaire', 'République', 'Goncourt', 'Belleville', 'Couronnes'],
      ),
      RouteStep(icon: 'walk', text: 'Walk to destination', dur: '4 min', sub: '320 m'),
    ],
  ),
  WfRoute(
    id: 3,
    duration: '28 min',
    arrive: '15:01',
    tag: 'Walk only',
    tagColor: 'walk',
    legs: [RouteLeg(mode: 'walk', label: '28 min walk')],
    transfers: 0,
    dist: '2.4 km',
    status: 'Quiet streets',
    statusOk: true,
    co2: '0 kg',
    fare: 'Free',
    steps: [
      RouteStep(icon: 'walk', text: 'Head north on Rue Oberkampf', dur: '12 min', sub: '1.0 km'),
      RouteStep(icon: 'walk', text: 'Turn right onto Rue de Turbigo', dur: '10 min', sub: '860 m'),
      RouteStep(icon: 'walk', text: 'Continue to destination', dur: '6 min', sub: '540 m'),
    ],
  ),
];
