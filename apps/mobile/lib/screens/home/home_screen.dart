import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../models/place.dart';
import '../../models/route_model.dart';
import '../../theme/app_colors.dart';
import '../../widgets/map_placeholder.dart';
import '../search/search_screen.dart';
import 'widgets/account_sheet.dart';
import 'widgets/favorites_drawer_content.dart';
import 'widgets/home_drawer_content.dart';
import 'widgets/navigation_drawer_content.dart';
import 'widgets/planning_drawer_content.dart';
import 'widgets/route_detail_content.dart';

enum _HomeState { home, planning, routeDetail, navigation }

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  _HomeState _state = _HomeState.home;
  bool _favoritesExpanded = false;
  bool _showAccount = false;
  bool _showSearch = false;
  final bool _variantB = false;
  Place? _selectedDestination;
  WfRoute? _selectedRoute;

  double _drawerHeight(double screenH) {
    return switch (_state) {
      _HomeState.home => _favoritesExpanded ? 580 : 140,
      _HomeState.planning => 560,
      _HomeState.routeDetail => 620,
      _HomeState.navigation => 240,
    };
  }

  void _goToState(_HomeState newState) {
    setState(() {
      _state = newState;
      _showAccount = false;
      _favoritesExpanded = false;
    });
  }

  void _openSearch() {
    setState(() {
      _showSearch = true;
      _showAccount = false;
    });
  }

  void _closeSearch() => setState(() => _showSearch = false);

  void _handlePlaceSelected(Place place) {
    setState(() {
      _selectedDestination = place;
      _showSearch = false;
    });
    _goToState(_HomeState.planning);
  }

  void _handleRouteSelected(WfRoute route) {
    setState(() => _selectedRoute = route);
    _goToState(_HomeState.routeDetail);
  }

  void _handleStartTravel() {
    _goToState(_HomeState.navigation);
  }

  void _handleEndNavigation() {
    setState(() => _selectedRoute = null);
    _goToState(_HomeState.home);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final screenH = MediaQuery.of(context).size.height;
    final targetH = _drawerHeight(screenH);

    return Scaffold(
      backgroundColor: c.mapBg,
      body: Stack(
        children: [
          // ── Map layer ──
          const MapPlaceholder(),

          // ── Navigation overlay buttons ──
          if (_state == _HomeState.navigation) ...[
            Positioned(
              top: 14 + MediaQuery.of(context).padding.top,
              left: 14,
              child: _NavOverlayButton(
                icon: Icons.close_rounded,
                color: c.danger,
                backgroundColor: c.surfaceCard,
                onTap: _handleEndNavigation,
              )
                  .animate()
                  .fadeIn(duration: 250.ms)
                  .scale(begin: const Offset(0.7, 0.7), curve: Curves.elasticOut),
            ),
            Positioned(
              top: 14 + MediaQuery.of(context).padding.top,
              right: 14,
              child: _NavOverlayButton(
                icon: Icons.volume_up_rounded,
                color: c.fg2,
                backgroundColor: c.surfaceCard,
                onTap: () {},
              )
                  .animate()
                  .fadeIn(duration: 250.ms, delay: 60.ms)
                  .scale(begin: const Offset(0.7, 0.7), curve: Curves.elasticOut, delay: 60.ms),
            ),
          ],

          // ── Bottom drawer ──
          AnimatedPositioned(
            duration: 280.ms,
            curve: Curves.easeOutCubic,
            bottom: 0,
            left: 0,
            right: 0,
            height: targetH + MediaQuery.of(context).padding.bottom,
            child: _DrawerShell(
              c: c,
              onDragUp: () {
                if (_state == _HomeState.home) {
                  setState(() => _favoritesExpanded = true);
                }
              },
              onDragDown: () {
                if (_state == _HomeState.home && _favoritesExpanded) {
                  setState(() => _favoritesExpanded = false);
                } else if (_state == _HomeState.planning ||
                    _state == _HomeState.routeDetail) {
                  _goToState(_HomeState.home);
                }
              },
              child: AnimatedSwitcher(
                duration: 220.ms,
                transitionBuilder: (child, anim) => FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 0.05),
                      end: Offset.zero,
                    ).animate(CurvedAnimation(
                      parent: anim,
                      curve: Curves.easeOut,
                    )),
                    child: child,
                  ),
                ),
                child: KeyedSubtree(
                  key: ValueKey('${_state.name}-$_favoritesExpanded'),
                  child: _buildDrawerContent(c),
                ),
              ),
            ),
          ),

          // ── Account sheet overlay ──
          if (_showAccount)
            Positioned.fill(
              child: AccountSheet(onClose: () => setState(() => _showAccount = false)),
            ),

          // ── Search overlay (full-screen) ──
          if (_showSearch)
            Positioned.fill(
              child: SearchScreen(
                onSelect: _handlePlaceSelected,
                onBack: _closeSearch,
              )
                  .animate()
                  .fadeIn(duration: 200.ms)
                  .slideY(begin: 0.04, end: 0, duration: 220.ms),
            ),
        ],
      ),
    );
  }

  Widget _buildDrawerContent(AppColors c) {
    if (_state == _HomeState.home && _favoritesExpanded) {
      return FavoritesDrawerContent(
        onSearchTap: _openSearch,
        onAvatarTap: () => setState(() => _showAccount = !_showAccount),
        onPlaceTap: _handlePlaceSelected,
      );
    }

    return switch (_state) {
      _HomeState.home => HomeDrawerContent(
          variantB: _variantB,
          onSearchTap: _openSearch,
          onAvatarTap: () => setState(() => _showAccount = !_showAccount),
        ),
      _HomeState.planning => PlanningDrawerContent(
          destination: _selectedDestination,
          onBack: () => _goToState(_HomeState.home),
          onSelectRoute: _handleRouteSelected,
        ),
      _HomeState.routeDetail => RouteDetailContent(
          route: _selectedRoute!,
          onBack: () => _goToState(_HomeState.planning),
          onStartTravel: _handleStartTravel,
        ),
      _HomeState.navigation => NavigationDrawerContent(
          route: _selectedRoute!,
          onEnd: _handleEndNavigation,
        ),
    };
  }
}

class _DrawerShell extends StatelessWidget {
  final AppColors c;
  final Widget child;
  final VoidCallback? onDragUp;
  final VoidCallback? onDragDown;

  const _DrawerShell({
    required this.c,
    required this.child,
    this.onDragUp,
    this.onDragDown,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onVerticalDragEnd: (details) {
        if (details.velocity.pixelsPerSecond.dy < -300 ||
            details.primaryVelocity != null && details.primaryVelocity! < -200) {
          onDragUp?.call();
        } else if (details.velocity.pixelsPerSecond.dy > 300) {
          onDragDown?.call();
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: c.surfaceCard,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: c.border)),
          boxShadow: c.drawerShadow,
        ),
        clipBehavior: Clip.hardEdge,
        child: child,
      ),
    );
  }
}

class _NavOverlayButton extends StatefulWidget {
  final IconData icon;
  final Color color;
  final Color backgroundColor;
  final VoidCallback onTap;

  const _NavOverlayButton({
    required this.icon,
    required this.color,
    required this.backgroundColor,
    required this.onTap,
  });

  @override
  State<_NavOverlayButton> createState() => _NavOverlayButtonState();
}

class _NavOverlayButtonState extends State<_NavOverlayButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pressCtrl;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(vsync: this, duration: 80.ms, value: 1.0);
  }

  @override
  void dispose() {
    _pressCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return GestureDetector(
      onTapDown: (_) => _pressCtrl.animateTo(0.9),
      onTapUp: (_) {
        _pressCtrl.animateTo(1.0);
        widget.onTap();
      },
      onTapCancel: () => _pressCtrl.animateTo(1.0),
      child: ScaleTransition(
        scale: _pressCtrl,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: widget.backgroundColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: c.border),
            boxShadow: c.mediumShadow,
          ),
          child: Icon(widget.icon, size: 18, color: widget.color),
        ),
      ),
    );
  }
}
