import 'package:flutter/material.dart';
import '../../../../core/models/folder.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/conversation.dart';

/// الشريط الجانبي والقائمة المنزلقة لشات جي بي تي (Sidebar / Drawer)
class ChatDrawer extends StatefulWidget {
  const ChatDrawer({
    super.key,
    required this.conversations,
    required this.currentConvId,
    required this.folders,
    required this.onSelectConv,
    required this.onNewChat,
    required this.onDeleteConv,
    required this.onRenameConv,
    required this.onPinConv,
    required this.onCreateFolder,
    required this.onDeleteFolder,
    required this.onMoveToFolder,
    required this.onOpenMemory,
    required this.onToggleTheme,
    required this.isDarkTheme,
    this.isRtl = true,
  });

  final List<Conversation> conversations;
  final String? currentConvId;
  final List<Folder> folders;
  final ValueChanged<String> onSelectConv;
  final VoidCallback onNewChat;
  final ValueChanged<String> onDeleteConv;
  final void Function(String id, String newTitle) onRenameConv;
  final ValueChanged<String> onPinConv;
  final ValueChanged<String> onCreateFolder;
  final ValueChanged<String> onDeleteFolder;
  final void Function(String convId, String? folderId) onMoveToFolder;
  final VoidCallback onOpenMemory;
  final VoidCallback onToggleTheme;
  final bool isDarkTheme;
  final bool isRtl;

  @override
  State<ChatDrawer> createState() => _ChatDrawerState();
}

class _ChatDrawerState extends State<ChatDrawer> {
  final TextEditingController _searchController = TextEditingController();
  String _search = '';
  final Set<String> _expandedFolders = {};

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showNewFolderDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(widget.isRtl ? 'إنشاء مجلد جديد' : 'New Folder'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: InputDecoration(
            hintText: widget.isRtl ? 'اسم المجلد أو المشروع' : 'Folder / Project Name',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(widget.isRtl ? 'إلغاء' : 'Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final name = controller.text.trim();
              if (name.isNotEmpty) {
                widget.onCreateFolder(name);
              }
              Navigator.of(ctx).pop();
            },
            child: Text(widget.isRtl ? 'إنشاء' : 'Create'),
          ),
        ],
      ),
    );
  }

  void _showRenameDialog(Conversation conv) {
    final controller = TextEditingController(text: conv.title);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(widget.isRtl ? 'إعادة تسمية المحادثة' : 'Rename Chat'),
        content: TextField(
          controller: controller,
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(widget.isRtl ? 'إلغاء' : 'Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final newName = controller.text.trim();
              if (newName.isNotEmpty) {
                widget.onRenameConv(conv.id, newName);
              }
              Navigator.of(ctx).pop();
            },
            child: Text(widget.isRtl ? 'حفظ' : 'Save'),
          ),
        ],
      ),
    );
  }

  void _showMoveFolderDialog(Conversation conv) {
    showDialog(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: Text(widget.isRtl ? 'نقل إلى مجلد' : 'Move to Folder'),
        children: [
          SimpleDialogOption(
            onPressed: () {
              widget.onMoveToFolder(conv.id, null);
              Navigator.of(ctx).pop();
            },
            child: Row(
              children: [
                const Icon(Icons.folder_off, size: 18),
                const SizedBox(width: 8),
                Text(widget.isRtl ? 'بدون مجلد' : 'No Folder'),
              ],
            ),
          ),
          ...widget.folders.map(
            (f) => SimpleDialogOption(
              onPressed: () {
                widget.onMoveToFolder(conv.id, f.id);
                Navigator.of(ctx).pop();
              },
              child: Row(
                children: [
                  const Icon(Icons.folder, size: 18, color: AppColors.primaryGold),
                  const SizedBox(width: 8),
                  Text(f.name),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF171717) : const Color(0xFFF9F9F9);
    final border = isDark ? const Color(0xFF282828) : const Color(0xFFE5E5E5);
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;

    final filtered = widget.conversations.where((c) {
      if (_search.isEmpty) return true;
      return c.title.toLowerCase().contains(_search.toLowerCase());
    }).toList();

    final unorganized = filtered.where((c) => c.folderId == null).toList();
    final pinned = unorganized.where((c) => c.isPinned).toList();
    final recent = unorganized.where((c) => !c.isPinned).toList();

    return Container(
      width: 280,
      color: bg,
      child: SafeArea(
        child: Column(
          children: [
            // Top Bar: New Chat
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
              child: ElevatedButton.icon(
                onPressed: widget.onNewChat,
                icon: const Icon(Icons.add, size: 18),
                label: Text(
                  widget.isRtl ? 'محادثة جديدة' : 'New chat',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  backgroundColor: isDark ? const Color(0xFF242424) : Colors.white,
                  foregroundColor: textColor,
                  elevation: 0,
                  side: BorderSide(color: border),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),

            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _search = val),
                decoration: InputDecoration(
                  hintText: widget.isRtl ? 'بحث في المحادثات...' : 'Search chats...',
                  prefixIcon: const Icon(Icons.search, size: 16),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  isDense: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: border),
                  ),
                ),
              ),
            ),

            // Folders Header & Action
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.isRtl ? 'المجلدات والمشاريع' : 'Folders & Projects',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                  InkWell(
                    onTap: _showNewFolderDialog,
                    borderRadius: BorderRadius.circular(4),
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: Icon(
                        Icons.create_new_folder_outlined,
                        size: 16,
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Folders List
            if (widget.folders.isNotEmpty)
              ...widget.folders.map((folder) {
                final isExpanded = _expandedFolders.contains(folder.id);
                final folderChats = filtered.where((c) => c.folderId == folder.id).toList();

                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ListTile(
                      dense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14),
                      leading: Icon(
                        isExpanded ? Icons.folder_open : Icons.folder,
                        size: 17,
                        color: AppColors.primaryGold,
                      ),
                      title: Text(
                        folder.name,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '${folderChats.length}',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            isExpanded ? Icons.expand_less : Icons.expand_more,
                            size: 16,
                          ),
                        ],
                      ),
                      onTap: () {
                        setState(() {
                          if (isExpanded) {
                            _expandedFolders.remove(folder.id);
                          } else {
                            _expandedFolders.add(folder.id);
                          }
                        });
                      },
                    ),
                    if (isExpanded)
                      ...folderChats.map((c) => _buildChatItem(c, textColor, isDark, border, indent: true)),
                  ],
                );
              }),

            const Divider(height: 16),

            // Chat Conversations List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: [
                  if (pinned.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 4, 8, 4),
                      child: Text(
                        widget.isRtl ? 'المثبتة' : 'Pinned',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    ),
                    ...pinned.map((c) => _buildChatItem(c, textColor, isDark, border)),
                    const SizedBox(height: 8),
                  ],
                  if (recent.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 4, 8, 4),
                      child: Text(
                        widget.isRtl ? 'المحادثات الأخيرة' : 'Recent Chats',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    ),
                    ...recent.map((c) => _buildChatItem(c, textColor, isDark, border)),
                  ],
                  if (filtered.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Center(
                        child: Text(
                          widget.isRtl ? 'لا توجد محادثات' : 'No chats found',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            const Divider(height: 1),

            // Bottom Profile / Settings Actions
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Column(
                children: [
                  // Memory Log button
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.psychology, size: 18, color: AppColors.primaryGold),
                    title: Text(
                      widget.isRtl ? 'سجل الذاكرة الذكية' : 'ChatGPT Memory',
                      style: const TextStyle(fontSize: 13),
                    ),
                    onTap: widget.onOpenMemory,
                  ),

                  // Theme Switcher
                  ListTile(
                    dense: true,
                    leading: Icon(
                      widget.isDarkTheme ? Icons.light_mode : Icons.dark_mode,
                      size: 18,
                    ),
                    title: Text(
                      widget.isDarkTheme
                          ? (widget.isRtl ? 'الوضع الفاتح' : 'Light Mode')
                          : (widget.isRtl ? 'الوضع الداكن' : 'Dark Mode'),
                      style: const TextStyle(fontSize: 13),
                    ),
                    onTap: widget.onToggleTheme,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatItem(
    Conversation c,
    Color textColor,
    bool isDark,
    Color border, {
    bool indent = false,
  }) {
    final isSelected = c.id == widget.currentConvId;
    final itemBg = isSelected
        ? (isDark ? const Color(0xFF262626) : const Color(0xFFEBEBEB))
        : Colors.transparent;

    return Container(
      margin: EdgeInsets.only(bottom: 2, right: indent ? 12 : 0),
      decoration: BoxDecoration(
        color: itemBg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 8),
        leading: Icon(
          c.isPinned ? Icons.push_pin : Icons.chat_bubble_outline,
          size: 15,
          color: c.isPinned ? AppColors.primaryGold : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
        ),
        title: Text(
          c.title,
          style: TextStyle(
            fontSize: 13,
            color: textColor,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: PopupMenuButton<String>(
          icon: Icon(
            Icons.more_horiz,
            size: 16,
            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          ),
          onSelected: (val) {
            if (val == 'pin') widget.onPinConv(c.id);
            if (val == 'rename') _showRenameDialog(c);
            if (val == 'move') _showMoveFolderDialog(c);
            if (val == 'delete') widget.onDeleteConv(c.id);
          },
          itemBuilder: (ctx) => [
            PopupMenuItem(
              value: 'pin',
              child: Row(
                children: [
                  Icon(c.isPinned ? Icons.pin_drop_outlined : Icons.push_pin, size: 16),
                  const SizedBox(width: 8),
                  Text(c.isPinned ? (widget.isRtl ? 'إلغاء التثبيت' : 'Unpin') : (widget.isRtl ? 'تثبيت' : 'Pin')),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'rename',
              child: Row(
                children: [
                  const Icon(Icons.edit, size: 16),
                  const SizedBox(width: 8),
                  Text(widget.isRtl ? 'إعادة تسمية' : 'Rename'),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'move',
              child: Row(
                children: [
                  const Icon(Icons.folder, size: 16),
                  const SizedBox(width: 8),
                  Text(widget.isRtl ? 'نقل إلى مجلد' : 'Move to folder'),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  const Icon(Icons.delete, size: 16, color: AppColors.error),
                  const SizedBox(width: 8),
                  Text(widget.isRtl ? 'حذف' : 'Delete', style: const TextStyle(color: AppColors.error)),
                ],
              ),
            ),
          ],
        ),
        onTap: () => widget.onSelectConv(c.id),
      ),
    );
  }
}
