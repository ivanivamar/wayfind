import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../data/mock_data.dart';
import '../../models/place.dart';
import '../../theme/app_colors.dart';
import '../../widgets/place_row.dart';
import '../../widgets/section_label.dart';

class SearchScreen extends StatefulWidget {
  final ValueChanged<Place> onSelect;
  final VoidCallback onBack;

  const SearchScreen({
    super.key,
    required this.onSelect,
    required this.onBack,
  });

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _queryCtrl = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _queryCtrl.addListener(() {
      setState(() => _query = _queryCtrl.text);
    });
  }

  @override
  void dispose() {
    _queryCtrl.dispose();
    super.dispose();
  }

  List<Place>? get _filtered {
    if (_query.isEmpty) return null;
    return wfSuggestions
        .where((s) => s.name.toLowerCase().contains(_query.toLowerCase()))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    final filtered = _filtered;

    return Container(
      color: c.bg,
      child: Column(
        children: [
          // Search header
          Container(
            color: c.surfaceCard,
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: c.border)),
            ),
            child: Row(
              children: [
                // Back button
                GestureDetector(
                  onTap: widget.onBack,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(Icons.arrow_back_rounded, size: 18, color: c.fg1),
                  ),
                ),
                const SizedBox(width: 8),
                // Search field
                Expanded(
                  child: _SearchField(
                    controller: _queryCtrl,
                    c: c,
                  ),
                ),
              ],
            ),
          )
              .animate()
              .fadeIn(duration: 200.ms)
              .slideY(begin: -0.04, end: 0),

          // Results
          Expanded(
            child: AnimatedSwitcher(
              duration: 200.ms,
              child: filtered == null
                  ? _DefaultContent(
                      key: const ValueKey('default'),
                      onSelect: widget.onSelect,
                    )
                  : filtered.isEmpty
                      ? _EmptyState(query: _query, c: c, key: const ValueKey('empty'))
                      : _ResultsList(
                          key: ValueKey('results-$_query'),
                          results: filtered,
                          onSelect: widget.onSelect,
                        ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchField extends StatefulWidget {
  final TextEditingController controller;
  final AppColors c;

  const _SearchField({required this.controller, required this.c});

  @override
  State<_SearchField> createState() => _SearchFieldState();
}

class _SearchFieldState extends State<_SearchField>
    with SingleTickerProviderStateMixin {
  late final AnimationController _focusCtrl;

  @override
  void initState() {
    super.initState();
    _focusCtrl = AnimationController(
      vsync: this,
      duration: 160.ms,
      value: 1.0,
    );
  }

  @override
  void dispose() {
    _focusCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.c;
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.primary, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: c.primaryRing,
            blurRadius: 0,
            spreadRadius: 3,
          ),
        ],
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Icon(Icons.search_rounded, size: 16, color: c.primary),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: widget.controller,
              autofocus: true,
              style: TextStyle(fontSize: 14, color: c.fg1),
              decoration: InputDecoration(
                hintText: 'Search a place or address',
                hintStyle: TextStyle(fontSize: 14, color: c.fg3),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
          if (widget.controller.text.isNotEmpty)
            GestureDetector(
              onTap: () => widget.controller.clear(),
              child: Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Icon(Icons.close_rounded, size: 14, color: c.fg3),
              ),
            ),
        ],
      ),
    );
  }
}

class _DefaultContent extends StatelessWidget {
  final ValueChanged<Place> onSelect;

  const _DefaultContent({super.key, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final c = context.wfColors;
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        SectionLabel('Saved places'),
        for (final (i, fav) in wfFavorites.take(2).indexed)
          PlaceRow(
            place: fav,
            animationIndex: i,
            onTap: () => onSelect(fav),
          ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
          child: _AddSavedButton(c: c),
        ),
        SectionLabel('Recent'),
        for (final (i, rec) in wfRecents.indexed)
          PlaceRow(
            place: rec,
            animationIndex: 3 + i,
            onTap: () => onSelect(rec),
          ),
      ],
    );
  }
}

class _ResultsList extends StatelessWidget {
  final List<Place> results;
  final ValueChanged<Place> onSelect;

  const _ResultsList({super.key, required this.results, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        SectionLabel('Results'),
        for (final (i, place) in results.indexed)
          PlaceRow(
            place: place,
            animationIndex: i,
            onTap: () => onSelect(place),
          ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String query;
  final AppColors c;

  const _EmptyState({super.key, required this.query, required this.c});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Text(
            'No results for "$query"',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: c.fg2,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            'Try a different place or address.',
            style: TextStyle(fontSize: 12, color: c.fg3),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 200.ms)
        .scale(begin: const Offset(0.95, 0.95));
  }
}

class _AddSavedButton extends StatelessWidget {
  final AppColors c;

  const _AddSavedButton({required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: c.borderStrong),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.bookmark_outline_rounded, size: 14, color: c.primary),
          const SizedBox(width: 8),
          Text(
            'Add a saved place',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: c.primary,
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 200.ms, delay: 100.ms);
  }
}
