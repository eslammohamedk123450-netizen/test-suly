import 'package:flutter/material.dart';
import '../../../../core/models/attachment_item.dart';
import '../../../../core/theme/app_colors.dart';

/// مفتش المستندات وجداول البيانات التفاعلي (Document & CSV Inspector)
class FileInspectorDialog extends StatefulWidget {
  const FileInspectorDialog({
    super.key,
    required this.attachment,
    required this.onAskPrompt,
    this.isRtl = true,
  });

  final AttachmentItem attachment;
  final ValueChanged<String> onAskPrompt;
  final bool isRtl;

  @override
  State<FileInspectorDialog> createState() => _FileInspectorDialogState();
}

class _FileInspectorDialogState extends State<FileInspectorDialog> {
  final TextEditingController _searchController = TextEditingController();
  String _filterText = '';
  int _currentPage = 0;
  static const int _pageSize = 8;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  bool get _isCsv =>
      widget.attachment.name.toLowerCase().endsWith('.csv') ||
      widget.attachment.mimeType.contains('csv');

  List<List<String>> _parseCsv(String content) {
    final lines = content.split('\n').where((l) => l.trim().isNotEmpty).toList();
    return lines.map((l) => l.split(',').map((c) => c.trim()).toList()).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final border = isDark ? const Color(0xFF333333) : const Color(0xFFE5E5E5);
    final rawText = widget.attachment.textContent ?? widget.attachment.data;
    final isCsvFile = _isCsv && rawText.isNotEmpty;

    return Dialog(
      backgroundColor: bg,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 800,
        height: 600,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  isCsvFile ? Icons.table_chart : Icons.insert_drive_file,
                  color: AppColors.primaryGold,
                  size: 24,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.attachment.name,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        widget.isRtl
                            ? '${widget.attachment.type == 'image' ? 'صورة' : 'مستند'} • ${(widget.attachment.size ?? 0) ~/ 1024} KB'
                            : '${widget.attachment.type.toUpperCase()} • ${(widget.attachment.size ?? 0) ~/ 1024} KB',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const Divider(height: 20),

            // Content Viewer
            Expanded(
              child: isCsvFile
                  ? _buildCsvViewer(rawText, isDark, border)
                  : _buildTextViewer(rawText, isDark, border),
            ),

            const SizedBox(height: 12),
            // Quick AI Action Prompts
            Text(
              widget.isRtl ? 'تحليل فوري بواسطة الذكاء الاصطناعي:' : 'Quick AI Analysis Prompts:',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildPromptChip(
                    widget.isRtl ? '📊 لخص أهم الاتجاهات' : '📊 Summarize key trends',
                    'قم بتحليل هذا الملف وتلخيص أهم البيانات والأنماط والأرقام الأساسية في نقاط واضحة.',
                  ),
                  const SizedBox(width: 6),
                  _buildPromptChip(
                    widget.isRtl ? '🔍 فحص القيم الشاذة' : '🔍 Detect anomalies',
                    'افحص محتويات هذا الملف واستخرج أي قيم شاذة (Outliers) أو أخطاء محتملة.',
                  ),
                  const SizedBox(width: 6),
                  _buildPromptChip(
                    widget.isRtl ? '📈 اقتراح رسم بياني' : '📈 Suggest a chart',
                    'اقترح أفضل طريقة لتصور هذا الجدول بصرياً واكتب كود الرسم البياني المناسب.',
                  ),
                  const SizedBox(width: 6),
                  _buildPromptChip(
                    widget.isRtl ? '🐍 توليد كود Python' : '🐍 Python data script',
                    'اكتب كود بايثون مع مكتبة pandas لمعالجة وتنظيف بيانات هذا الملف.',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCsvViewer(String rawText, bool isDark, Color border) {
    final allRows = _parseCsv(rawText);
    if (allRows.isEmpty) {
      return Center(
        child: Text(widget.isRtl ? 'الملف فارغ' : 'Empty file'),
      );
    }

    final headers = allRows.first;
    final dataRows = allRows.skip(1).where((row) {
      if (_filterText.isEmpty) return true;
      return row.any((cell) => cell.toLowerCase().contains(_filterText.toLowerCase()));
    }).toList();

    final totalPages = (dataRows.length / _pageSize).ceil();
    final safePage = _currentPage >= totalPages ? 0 : _currentPage;
    final startIndex = safePage * _pageSize;
    final endIndex = (startIndex + _pageSize < dataRows.length) ? startIndex + _pageSize : dataRows.length;
    final pageRows = (startIndex < dataRows.length) ? dataRows.sublist(startIndex, endIndex) : <List<String>>[];

    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: TextField(
            controller: _searchController,
            onChanged: (val) => setState(() {
              _filterText = val;
              _currentPage = 0;
            }),
            decoration: InputDecoration(
              hintText: widget.isRtl ? 'بحث في صفوف الجدول...' : 'Search rows...',
              prefixIcon: const Icon(Icons.search, size: 18),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: border),
              ),
            ),
          ),
        ),

        // Scrollable Table
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(color: border),
              borderRadius: BorderRadius.circular(8),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columnSpacing: 24,
                  headingRowColor: WidgetStateProperty.all(
                    isDark ? const Color(0xFF262626) : const Color(0xFFF3F3F3),
                  ),
                  columns: headers
                      .map((h) => DataColumn(
                            label: Text(
                              h,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ))
                      .toList(),
                  rows: pageRows
                      .map(
                        (r) => DataRow(
                          cells: List.generate(
                            headers.length,
                            (i) => DataCell(
                              Text(
                                i < r.length ? r[i] : '',
                                style: const TextStyle(fontSize: 12),
                              ),
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
          ),
        ),

        // Pagination
        if (totalPages > 1)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.isRtl
                      ? 'عرض ${startIndex + 1}-${endIndex} من إجمالي ${dataRows.length}'
                      : 'Showing ${startIndex + 1}-${endIndex} of ${dataRows.length}',
                  style: const TextStyle(fontSize: 11),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left, size: 18),
                      onPressed: safePage > 0 ? () => setState(() => _currentPage--) : null,
                    ),
                    Text('${safePage + 1} / $totalPages', style: const TextStyle(fontSize: 12)),
                    IconButton(
                      icon: const Icon(Icons.chevron_right, size: 18),
                      onPressed: safePage < totalPages - 1 ? () => setState(() => _currentPage++) : null,
                    ),
                  ],
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildTextViewer(String rawText, bool isDark, Color border) {
    final lines = rawText.split('\n');
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141414) : const Color(0xFFF7F7F7),
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: lines.length,
        itemBuilder: (context, index) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 36,
                child: Text(
                  '${index + 1}',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: isDark ? const Color(0xFF6E6E6E) : const Color(0xFF9E9E9E),
                  ),
                ),
              ),
              Expanded(
                child: SelectableText(
                  lines[index],
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: isDark ? AppColors.darkText : AppColors.lightText,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPromptChip(String label, String prompt) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 12)),
      onPressed: () {
        Navigator.of(context).pop();
        widget.onAskPrompt(prompt);
      },
      backgroundColor: AppColors.primaryGold.withValues(alpha: 0.1),
      side: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.2)),
    );
  }
}
