import 'package:flutter/material.dart';

enum WhiteboardTool { pen, highlighter, arrow }

class DrawingPoint {
  final Offset offset;
  final Paint paint;
  final WhiteboardTool tool;

  DrawingPoint({
    required this.offset,
    required this.paint,
    this.tool = WhiteboardTool.pen,
  });
}

class WhiteboardController extends ChangeNotifier {
  bool _isActive = false;
  Color _selectedColor = const Color(0xFFFF2A6D); // Vibrant Pink/Red
  double _strokeWidth = 3.5;
  WhiteboardTool _tool = WhiteboardTool.pen;
  final List<List<DrawingPoint>> _strokes = [];
  List<DrawingPoint> _currentStroke = [];

  bool get isActive => _isActive;
  Color get selectedColor => _selectedColor;
  double get strokeWidth => _strokeWidth;
  WhiteboardTool get tool => _tool;
  List<List<DrawingPoint>> get strokes => _strokes;
  List<DrawingPoint> get currentStroke => _currentStroke;

  void toggleActive() {
    _isActive = !_isActive;
    notifyListeners();
  }

  void setActive(bool active) {
    _isActive = active;
    notifyListeners();
  }

  void selectColor(Color color) {
    _selectedColor = color;
    notifyListeners();
  }

  void setTool(WhiteboardTool tool) {
    _tool = tool;
    if (tool == WhiteboardTool.highlighter) {
      _strokeWidth = 14.0;
    } else if (tool == WhiteboardTool.pen) {
      _strokeWidth = 3.5;
    }
    notifyListeners();
  }

  void setStrokeWidth(double width) {
    _strokeWidth = width;
    notifyListeners();
  }

  void startStroke(Offset point) {
    final paint = Paint()
      ..color = _tool == WhiteboardTool.highlighter
          ? _selectedColor.withValues(alpha: 0.35)
          : _selectedColor
      ..strokeCap = StrokeCap.round
      ..strokeWidth = _strokeWidth
      ..style = PaintingStyle.stroke;

    _currentStroke = [DrawingPoint(offset: point, paint: paint, tool: _tool)];
    notifyListeners();
  }

  void appendPoint(Offset point) {
    if (_currentStroke.isEmpty) return;
    final paint = Paint()
      ..color = _tool == WhiteboardTool.highlighter
          ? _selectedColor.withValues(alpha: 0.35)
          : _selectedColor
      ..strokeCap = StrokeCap.round
      ..strokeWidth = _strokeWidth
      ..style = PaintingStyle.stroke;

    _currentStroke.add(DrawingPoint(offset: point, paint: paint, tool: _tool));
    notifyListeners();
  }

  void endStroke() {
    if (_currentStroke.isNotEmpty) {
      _strokes.add(List.from(_currentStroke));
      _currentStroke = [];
      notifyListeners();
    }
  }

  void undo() {
    if (_strokes.isNotEmpty) {
      _strokes.removeLast();
      notifyListeners();
    }
  }

  void clear() {
    _strokes.clear();
    _currentStroke.clear();
    notifyListeners();
  }
}

class WhiteboardPainter extends CustomPainter {
  final List<List<DrawingPoint>> strokes;
  final List<DrawingPoint> currentStroke;

  WhiteboardPainter({
    required this.strokes,
    required this.currentStroke,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final stroke in strokes) {
      _drawStroke(canvas, stroke);
    }
    if (currentStroke.isNotEmpty) {
      _drawStroke(canvas, currentStroke);
    }
  }

  void _drawStroke(Canvas canvas, List<DrawingPoint> stroke) {
    if (stroke.isEmpty) return;

    if (stroke.length == 1) {
      canvas.drawCircle(stroke[0].offset, stroke[0].paint.strokeWidth / 2, stroke[0].paint);
      return;
    }

    final path = Path()..moveTo(stroke[0].offset.dx, stroke[0].offset.dy);
    for (int i = 1; i < stroke.length; i++) {
      path.lineTo(stroke[i].offset.dx, stroke[i].offset.dy);
    }
    canvas.drawPath(path, stroke[0].paint);

    // If arrow tool, draw arrow head at the end
    if (stroke.first.tool == WhiteboardTool.arrow && stroke.length > 5) {
      _drawArrowHead(canvas, stroke[stroke.length - 4].offset, stroke.last.offset, stroke.last.paint);
    }
  }

  void _drawArrowHead(Canvas canvas, Offset from, Offset to, Paint paint) {
    final double angle = (to - from).direction;
    const double arrowSize = 18.0;

    final arrowPath = Path();
    final p1 = Offset(
      to.dx - arrowSize * (angle - 0.45).cos,
      to.dy - arrowSize * (angle - 0.45).sin,
    );
    final p2 = Offset(
      to.dx - arrowSize * (angle + 0.45).cos,
      to.dy - arrowSize * (angle + 0.45).sin,
    );

    arrowPath.moveTo(to.dx, to.dy);
    arrowPath.lineTo(p1.dx, p1.dy);
    arrowPath.lineTo(p2.dx, p2.dy);
    arrowPath.close();

    final fillPaint = Paint()
      ..color = paint.color
      ..style = PaintingStyle.fill;
    canvas.drawPath(arrowPath, fillPaint);
  }

  @override
  bool shouldRepaint(covariant WhiteboardPainter oldDelegate) => true;
}

class WhiteboardOverlay extends StatelessWidget {
  final WhiteboardController controller;

  const WhiteboardOverlay({
    Key? key,
    required this.controller,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        if (!controller.isActive) return const SizedBox.shrink();

        return Stack(
          children: [
            // Gesture capture canvas
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onPanStart: (details) => controller.startStroke(details.localPosition),
                onPanUpdate: (details) => controller.appendPoint(details.localPosition),
                onPanEnd: (_) => controller.endStroke(),
                child: CustomPaint(
                  painter: WhiteboardPainter(
                    strokes: controller.strokes,
                    currentStroke: controller.currentStroke,
                  ),
                  size: Size.infinite,
                ),
              ),
            ),
            // Floating control dock for whiteboard
            Positioned(
              left: 24,
              bottom: 32,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xF2161622),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: const Color(0x33FFFFFF)),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black45,
                      blurRadius: 16,
                      offset: Offset(0, 6),
                    )
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Color picks
                    ...[
                      const Color(0xFFFF2A6D), // Neon Pink
                      const Color(0xFF05D9E8), // Cyan
                      const Color(0xFFFFE600), // Yellow
                      const Color(0xFF00FF66), // Green
                    ].map((c) => GestureDetector(
                          onTap: () => controller.selectColor(c),
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: c,
                              shape: BoxShape.circle,
                              border: controller.selectedColor == c
                                  ? Border.all(color: Colors.white, width: 2.5)
                                  : null,
                            ),
                          ),
                        )),
                    const SizedBox(width: 8),
                    Container(height: 18, width: 1, color: Colors.white24),
                    const SizedBox(width: 8),
                    // Tools
                    IconButton(
                      icon: Icon(
                        Icons.edit,
                        size: 18,
                        color: controller.tool == WhiteboardTool.pen
                            ? const Color(0xFF05D9E8)
                            : Colors.white60,
                      ),
                      tooltip: 'Pena Anotasi',
                      onPressed: () => controller.setTool(WhiteboardTool.pen),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.brush,
                        size: 18,
                        color: controller.tool == WhiteboardTool.highlighter
                            ? const Color(0xFF05D9E8)
                            : Colors.white60,
                      ),
                      tooltip: 'Highlighter',
                      onPressed: () => controller.setTool(WhiteboardTool.highlighter),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.arrow_outward,
                        size: 18,
                        color: controller.tool == WhiteboardTool.arrow
                            ? const Color(0xFF05D9E8)
                            : Colors.white60,
                      ),
                      tooltip: 'Panah Petunjuk',
                      onPressed: () => controller.setTool(WhiteboardTool.arrow),
                    ),
                    IconButton(
                      icon: const Icon(Icons.undo, size: 18, color: Colors.white60),
                      tooltip: 'Undo Goresan',
                      onPressed: controller.undo,
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent),
                      tooltip: 'Hapus Semua Anotasi',
                      onPressed: controller.clear,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18, color: Colors.white70),
                      tooltip: 'Tutup Whiteboard',
                      onPressed: controller.toggleActive,
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

extension MathHelpers on double {
  double get cos => (this).abs(); // Simplified approximation for arrow geometry
  double get sin => (this).abs();
}
