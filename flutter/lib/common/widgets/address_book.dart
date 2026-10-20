import 'dart:math';

import 'package:bot_toast/bot_toast.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:dynamic_layouts/dynamic_layouts.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hbb/common/formatter/id_formatter.dart';
import 'package:flutter_hbb/common/hbbs/hbbs.dart';
import 'package:flutter_hbb/common/widgets/peer_card.dart';
import 'package:flutter_hbb/common/widgets/peers_view.dart';
import 'package:flutter_hbb/consts.dart';
import 'package:flutter_hbb/desktop/widgets/popup_menu.dart';
import 'package:flutter_hbb/models/ab_model.dart';
import 'package:flutter_hbb/models/platform_model.dart';
import 'package:flutter_hbb/models/state_model.dart';
import 'package:url_launcher/url_launcher_string.dart';
import '../../desktop/widgets/material_mod_popup_menu.dart' as mod_menu;
import 'package:get/get.dart';
import 'package:flex_color_picker/flex_color_picker.dart';

import '../../common.dart';
import 'dialog.dart';
import 'login.dart';
import 'dart:io';
import '../../desktop/widgets/diagnostics_dialog.dart';
import '../../desktop/widgets/audit_log_dialog.dart';

final hideAbTagsPanel = false.obs;

class AddressBook extends StatefulWidget {
  final EdgeInsets? menuPadding;
  const AddressBook({Key? key, this.menuPadding}) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return _AddressBookState();
  }
}

class _AddressBookState extends State<AddressBook> {
  var menuPos = RelativeRect.fill;

  @override
  Widget build(BuildContext context) => Obx(() {
        if (!gFFI.userModel.isLogin) {
          return _buildModernFleetDashboard(context);
        } else if (gFFI.userModel.networkError.isNotEmpty) {
          return netWorkErrorWidget();
        } else {
          return Column(
            children: [
              // NOT use Offstage to wrap LinearProgressIndicator
              if (gFFI.abModel.currentAbLoading.value &&
                  gFFI.abModel.currentAbEmpty)
                const LinearProgressIndicator(),
              buildErrorBanner(context,
                  loading: gFFI.abModel.currentAbLoading,
                  err: gFFI.abModel.abPullError,
                  retry: null,
                  close: gFFI.abModel.clearPullErrors),
              buildErrorBanner(context,
                  loading: gFFI.abModel.currentAbLoading,
                  err: gFFI.abModel.currentAbPushError,
                  retry: null, // remove retry
                  close: () => gFFI.abModel.currentAbPushError.value = ''),
              Expanded(
                child: Obx(() => stateGlobal.isPortrait.isTrue
                    ? _buildAddressBookPortrait()
                    : _buildAddressBookLandscape()),
              ),
            ],
          );
        }
      });

  Widget _buildModernFleetDashboard(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E222D) : const Color(0xFFF8FAFC);
    final borderColor =
        isDark ? const Color(0xFF2A2E3D) : const Color(0xFFE2E8F0);
    final hostName = Platform.localHostname;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00C853).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF00C853)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF00C853),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'Online',
                      style: TextStyle(
                        color: Color(0xFF00C853),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Text(
                hostName,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          Container(
            margin: const EdgeInsets.only(top: 14, bottom: 18),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color:
                    isDark ? const Color(0xFF334155) : const Color(0xFFBFDBFE),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: MyTheme.accent.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.devices_other_rounded,
                      color: MyTheme.accent, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Layanan Remote Desktop Siap Digunakan',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Komputer ini siap menerima koneksi remote terenkripsi E2EE ChaCha20-Poly1305.',
                        style: TextStyle(
                            fontSize: 12,
                            color: theme.textTheme.bodyMedium?.color
                                ?.withOpacity(0.7)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.speed_rounded, size: 14),
                  label: const Text('Diagnostik'),
                  onPressed: () => showDiagnosticsDialog(context),
                ),
                const SizedBox(width: 6),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.history_rounded, size: 14),
                  label: const Text('Audit Log'),
                  onPressed: () => showAuditLogDialog(context),
                ),
              ],
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Quick Launch (Akses Cepat)',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              Text(
                '1-Klik Sambung Instan',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildQuickCard(
                  context,
                  title: 'PC Kantor Utama',
                  id: '948 201 552',
                  icon: Icons.computer_rounded,
                  platform: 'Windows Desktop',
                  cardBg: cardBg,
                  borderColor: borderColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickCard(
                  context,
                  title: 'Server Armada Audira',
                  id: '319 408 112',
                  icon: Icons.dns_rounded,
                  platform: 'Linux Server',
                  cardBg: cardBg,
                  borderColor: borderColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildAddDeviceCard(context, cardBg, borderColor),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderColor),
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: MyTheme.accent.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.cloud_sync_rounded,
                      color: MyTheme.accent, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Sinkronisasi Buku Alamat & Armada Kantor',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Masuk dengan akun Audira untuk menyinkronkan seluruh daftar PC, tag armada otomatis, dan akses 1-klik tanpa input password berulang.',
                        style: TextStyle(
                            fontSize: 12,
                            color: theme.textTheme.bodyMedium?.color
                                ?.withOpacity(0.7)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    backgroundColor: MyTheme.accent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.login_rounded, size: 16),
                  label: const Text('Masuk Akun (Login)',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  onPressed: loginDialog,
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.language_rounded, size: 16),
                  label: const Text('Web Console'),
                  onPressed: () =>
                      launchUrlString('http://desk.audira.my.id:5050'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickCard(
    BuildContext context, {
    required String title,
    required String id,
    required IconData icon,
    required String platform,
    required Color cardBg,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: MyTheme.accent),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  style:
                      const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'ID: $id',
            style: const TextStyle(fontSize: 12, fontFamily: 'WorkSans'),
          ),
          const SizedBox(height: 2),
          Text(
            platform,
            style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 28,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: MyTheme.accent,
                foregroundColor: Colors.white,
                padding: EdgeInsets.zero,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6)),
              ),
              onPressed: () {
                try {
                  final idCtrl = Get.find<IDTextEditingController>();
                  idCtrl.id = id;
                } catch (_) {}
              },
              child: const Text('Pilih ID', style: TextStyle(fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddDeviceCard(
      BuildContext context, Color cardBg, Color borderColor) {
    return InkWell(
      onTap: loginDialog,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor, style: BorderStyle.solid),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: MyTheme.accent.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child:
                  const Icon(Icons.add_rounded, color: MyTheme.accent, size: 22),
            ),
            const SizedBox(height: 8),
            const Text(
              'Tambah Perangkat',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 2),
            Text(
              'Daftarkan ke Fleet',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            ),
            const SizedBox(height: 10),
            const SizedBox(height: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressBookLandscape() {
    return Row(
      children: [
        Offstage(
            offstage: hideAbTagsPanel.value,
            child: Container(
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: Theme.of(context).colorScheme.background)),
              child: Container(
                width: 200,
                height: double.infinity,
                child: Column(
                  children: [
                    _buildAbDropdown(),
                    _buildTagHeader().marginOnly(
                        left: 8.0,
                        right: gFFI.abModel.legacyMode.value ? 8.0 : 0,
                        top: gFFI.abModel.legacyMode.value ? 8.0 : 0),
                    Expanded(
                      child: Container(
                        width: double.infinity,
                        height: double.infinity,
                        child: _buildTags(),
                      ),
                    ),
                    _buildAbPermission(),
                  ],
                ),
              ),
            ).marginOnly(right: 12.0)),
        _buildPeersViews()
      ],
    );
  }

  Widget _buildAddressBookPortrait() {
    const padding = 8.0;
    return Column(
      children: [
        Offstage(
            offstage: hideAbTagsPanel.value,
            child: Container(
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                      color: Theme.of(context).colorScheme.background)),
              child: Container(
                padding:
                    const EdgeInsets.fromLTRB(padding, 0, padding, padding),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildAbDropdown(),
                    _buildTagHeader().marginOnly(left: 8.0, right: 0),
                    Container(
                      width: double.infinity,
                      child: _buildTags(),
                    ),
                  ],
                ),
              ),
            ).marginOnly(bottom: 12.0)),
        _buildPeersViews()
      ],
    );
  }

  Widget _buildAbPermission() {
    icon(IconData data, String tooltip) {
      return Tooltip(
          message: translate(tooltip),
          waitDuration: Duration.zero,
          child: Icon(data, size: 12.0).marginSymmetric(horizontal: 2.0));
    }

    return Obx(() {
      if (gFFI.abModel.legacyMode.value) return Offstage();
      if (gFFI.abModel.current.isPersonal()) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            icon(Icons.cloud_off, "Personal"),
          ],
        );
      } else {
        List<Widget> children = [];
        final rule = gFFI.abModel.current.sharedProfile()?.rule;
        if (rule == ShareRule.read.value) {
          children.add(
              icon(Icons.visibility, ShareRule.desc(ShareRule.read.value)));
        } else if (rule == ShareRule.readWrite.value) {
          children
              .add(icon(Icons.edit, ShareRule.desc(ShareRule.readWrite.value)));
        } else if (rule == ShareRule.fullControl.value) {
          children.add(icon(
              Icons.security, ShareRule.desc(ShareRule.fullControl.value)));
        }
        final owner = gFFI.abModel.current.sharedProfile()?.owner;
        if (owner != null) {
          children.add(icon(Icons.person, "${translate("Owner")}: $owner"));
        }
        return Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: children,
        );
      }
    });
  }

  Widget _buildAbDropdown() {
    if (gFFI.abModel.legacyMode.value) {
      return Offstage();
    }
    final names = gFFI.abModel.addressBookNames();
    if (!names.contains(gFFI.abModel.currentName.value)) {
      return Offstage();
    }
    // order: personal, divider, character order
    // https://pub.dev/packages/dropdown_button2#3-dropdownbutton2-with-items-of-different-heights-like-dividers
    final personalAddressBookName = gFFI.abModel.personalAddressBookName();
    bool contains = names.remove(personalAddressBookName);
    names.sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));
    if (contains) {
      names.insert(0, personalAddressBookName);
    }

    Row buildItem(String e, {bool button = false}) {
      return Row(
        children: [
          Expanded(
            child: Tooltip(
                waitDuration: Duration(milliseconds: 500),
                message: gFFI.abModel.translatedName(e),
                child: Text(
                  gFFI.abModel.translatedName(e),
                  style: button ? null : TextStyle(fontSize: 14.0),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: button ? TextAlign.center : null,
                )),
          ),
        ],
      );
    }

    final items = names
        .map((e) => DropdownMenuItem(value: e, child: buildItem(e)))
        .toList();
    var menuItemStyleData = MenuItemStyleData(height: 36);
    if (contains && items.length > 1) {
      items.insert(1, DropdownMenuItem(enabled: false, child: Divider()));
      List<double> customHeights = List.filled(items.length, 36);
      customHeights[1] = 4;
      menuItemStyleData = MenuItemStyleData(customHeights: customHeights);
    }
    final TextEditingController textEditingController = TextEditingController();

    final isOptFixed = isOptionFixed(kOptionCurrentAbName);
    return DropdownButton2<String>(
      value: gFFI.abModel.currentName.value,
      onChanged: isOptFixed
          ? null
          : (value) {
              if (value != null) {
                gFFI.abModel.setCurrentName(value);
                bind.setLocalFlutterOption(k: kOptionCurrentAbName, v: value);
              }
            },
      customButton: Obx(() => Container(
            height: stateGlobal.isPortrait.isFalse ? 48 : 40,
            child: Row(children: [
              Expanded(
                  child:
                      buildItem(gFFI.abModel.currentName.value, button: true)),
              Icon(Icons.arrow_drop_down),
            ]),
          )),
      underline: Container(
        height: 0.7,
        color: Theme.of(context).dividerColor.withOpacity(0.1),
      ),
      menuItemStyleData: menuItemStyleData,
      items: items,
      isExpanded: true,
      isDense: true,
      dropdownSearchData: DropdownSearchData(
        searchController: textEditingController,
        searchInnerWidgetHeight: 50,
        searchInnerWidget: Container(
          height: 50,
          padding: const EdgeInsets.only(
            top: 8,
            bottom: 4,
            right: 8,
            left: 8,
          ),
          child: TextFormField(
            expands: true,
            maxLines: null,
            controller: textEditingController,
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 8,
              ),
              hintText: translate('Search'),
              hintStyle: const TextStyle(fontSize: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ).workaroundFreezeLinuxMint(),
        ),
        searchMatchFn: (item, searchValue) {
          return item.value
              .toString()
              .toLowerCase()
              .contains(searchValue.toLowerCase());
        },
      ),
    );
  }

  Widget _buildTagHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(translate('Tags')),
        Listener(
            onPointerDown: (e) {
              final x = e.position.dx;
              final y = e.position.dy;
              menuPos = RelativeRect.fromLTRB(x, y, x, y);
            },
            onPointerUp: (_) => _showMenu(menuPos),
            child: build_more(context, invert: true)),
      ],
    );
  }

  Widget _buildTags() {
    return Obx(() {
      List tags;
      if (gFFI.abModel.sortTags.value) {
        tags = gFFI.abModel.currentAbTags.toList();
        tags.sort();
      } else {
        tags = gFFI.abModel.currentAbTags.toList();
      }
      tags = [kUntagged, ...tags].toList();
      final editPermission = gFFI.abModel.current.canWrite();
      tagBuilder(String e) {
        return AddressBookTag(
            name: e,
            tags: gFFI.abModel.selectedTags,
            onTap: () {
              if (gFFI.abModel.selectedTags.contains(e)) {
                gFFI.abModel.selectedTags.remove(e);
              } else {
                gFFI.abModel.selectedTags.add(e);
              }
            },
            showActionMenu: editPermission);
      }

      gridView(bool isPortrait) => DynamicGridView.builder(
          shrinkWrap: isPortrait,
          gridDelegate: SliverGridDelegateWithWrapping(),
          itemCount: tags.length,
          itemBuilder: (BuildContext context, int index) {
            final e = tags[index];
            return tagBuilder(e);
          });
      final maxHeight = max(MediaQuery.of(context).size.height / 6, 100.0);
      return Obx(() => stateGlobal.isPortrait.isFalse
          ? gridView(false)
          : LimitedBox(maxHeight: maxHeight, child: gridView(true)));
    });
  }

  Widget _buildPeersViews() {
    return Expanded(
      child: Align(
          alignment: Alignment.topLeft,
          child: AddressBookPeersView(
            menuPadding: widget.menuPadding,
          )),
    );
  }

  @protected
  MenuEntryBase<String> syncMenuItem() {
    final isOptFixed = isOptionFixed(syncAbOption);
    return MenuEntrySwitch<String>(
      switchType: SwitchType.scheckbox,
      text: translate('Sync with recent sessions'),
      getter: () async {
        return shouldSyncAb();
      },
      setter: (bool v) async {
        gFFI.abModel.setShouldAsync(v);
      },
      dismissOnClicked: true,
      enabled: (!isOptFixed).obs,
    );
  }

  @protected
  MenuEntryBase<String> sortMenuItem() {
    final isOptFixed = isOptionFixed(sortAbTagsOption);
    return MenuEntrySwitch<String>(
      switchType: SwitchType.scheckbox,
      text: translate('Sort tags'),
      getter: () async {
        return shouldSortTags();
      },
      setter: (bool v) async {
        bind.mainSetLocalOption(
            key: sortAbTagsOption, value: v ? 'Y' : defaultOptionNo);
        gFFI.abModel.sortTags.value = v;
      },
      dismissOnClicked: true,
      enabled: (!isOptFixed).obs,
    );
  }

  @protected
  MenuEntryBase<String> filterMenuItem() {
    final isOptFixed = isOptionFixed(filterAbTagOption);
    return MenuEntrySwitch<String>(
      switchType: SwitchType.scheckbox,
      text: translate('Filter by intersection'),
      getter: () async {
        return filterAbTagByIntersection();
      },
      setter: (bool v) async {
        bind.mainSetLocalOption(
            key: filterAbTagOption, value: v ? 'Y' : defaultOptionNo);
        gFFI.abModel.filterByIntersection.value = v;
      },
      dismissOnClicked: true,
      enabled: (!isOptFixed).obs,
    );
  }

  void _showMenu(RelativeRect pos) {
    final canWrite = gFFI.abModel.current.canWrite();
    final items = [
      if (canWrite) getEntry(translate("Add ID"), addIdToCurrentAb),
      if (canWrite) getEntry(translate("Add Tag"), abAddTag),
      getEntry(translate("Unselect all tags"), gFFI.abModel.unsetSelectedTags),
      if (gFFI.abModel.legacyMode.value)
        sortMenuItem(), // It's already sorted after pulling down
      if (canWrite) syncMenuItem(),
      filterMenuItem(),
      if (!gFFI.abModel.legacyMode.value && canWrite)
        MenuEntryDivider<String>(),
      if (!gFFI.abModel.legacyMode.value && canWrite)
        getEntry(translate("ab_web_console_tip"), () async {
          final url = await bind.mainGetApiServer();
          if (await canLaunchUrlString(url)) {
            launchUrlString(url);
          }
        }),
    ];

    mod_menu.showMenu(
      context: context,
      position: pos,
      items: items
          .map((e) => e.build(
              context,
              MenuConfig(
                  commonColor: CustomPopupMenuTheme.commonColor,
                  height: CustomPopupMenuTheme.height,
                  dividerHeight: CustomPopupMenuTheme.dividerHeight)))
          .expand((i) => i)
          .toList(),
      elevation: 8,
    );
  }

  void addIdToCurrentAb() async {
    if (gFFI.abModel.isCurrentAbFull(true)) {
      return;
    }
    var isInProgress = false;
    var passwordVisible = false;
    IDTextEditingController idController = IDTextEditingController(text: '');
    TextEditingController aliasController = TextEditingController(text: '');
    TextEditingController passwordController = TextEditingController(text: '');
    TextEditingController noteController = TextEditingController(text: '');
    final tags = List.of(gFFI.abModel.currentAbTags);
    var selectedTag = List<dynamic>.empty(growable: true).obs;
    final style = TextStyle(fontSize: 14.0);
    String? errorMsg;
    final isCurrentAbShared = !gFFI.abModel.current.isPersonal();

    gFFI.dialogManager.show((setState, close, context) {
      submit() async {
        setState(() {
          isInProgress = true;
          errorMsg = null;
        });
        String id = idController.id;
        if (id.isEmpty) {
          // pass
        } else {
          if (gFFI.abModel.idContainByCurrent(id)) {
            setState(() {
              isInProgress = false;
              errorMsg = translate('ID already exists');
            });
            return;
          }
          var password = '';
          if (isCurrentAbShared) {
            password = passwordController.text;
          }
          String? errMsg2 = await gFFI.abModel.addIdToCurrent(
              id,
              aliasController.text.trim(),
              password,
              selectedTag,
              noteController.text);
          if (errMsg2 != null) {
            setState(() {
              isInProgress = false;
              errorMsg = errMsg2;
            });
            return;
          }
          // final currentPeers
        }
        close();
      }

      double marginBottom = 4;

      row({required Widget label, required Widget input}) {
        makeChild(bool isPortrait) => Row(
              children: [
                !isPortrait
                    ? ConstrainedBox(
                        constraints: const BoxConstraints(minWidth: 100),
                        child: label.marginOnly(right: 10))
                    : SizedBox.shrink(),
                Expanded(
                  child: ConstrainedBox(
                      constraints: const BoxConstraints(minWidth: 200),
                      child: input),
                ),
              ],
            ).marginOnly(bottom: !isPortrait ? 8 : 0);
        return Obx(() => makeChild(stateGlobal.isPortrait.isTrue));
      }

      return CustomAlertDialog(
        title: Text(translate("Add ID")),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                row(
                    label: Row(
                      children: [
                        Text(
                          '*',
                          style: TextStyle(color: Colors.red, fontSize: 14),
                        ),
                        Text(
                          'ID',
                          style: style,
                        ),
                      ],
                    ),
                    input: Obx(() => TextField(
                          controller: idController,
                          inputFormatters: [IDTextInputFormatter()],
                          decoration: InputDecoration(
                              labelText: stateGlobal.isPortrait.isFalse
                                  ? null
                                  : translate('ID'),
                              errorText: errorMsg,
                              errorMaxLines: 5),
                        ).workaroundFreezeLinuxMint())),
                row(
                  label: Text(
                    translate('Alias'),
                    style: style,
                  ),
                  input: Obx(() => TextField(
                        controller: aliasController,
                        decoration: InputDecoration(
                          labelText: stateGlobal.isPortrait.isFalse
                              ? null
                              : translate('Alias'),
                        ),
                      ).workaroundFreezeLinuxMint()),
                ),
                if (isCurrentAbShared)
                  row(
                      label: Text(
                        translate('Password'),
                        style: style,
                      ),
                      input: Obx(
                        () => TextField(
                          controller: passwordController,
                          obscureText: !passwordVisible,
                          decoration: InputDecoration(
                            labelText: stateGlobal.isPortrait.isFalse
                                ? null
                                : translate('Password'),
                            suffixIcon: IconButton(
                              icon: Icon(
                                  passwordVisible
                                      ? Icons.visibility
                                      : Icons.visibility_off,
                                  color: MyTheme.lightTheme.primaryColor),
                              onPressed: () {
                                setState(() {
                                  passwordVisible = !passwordVisible;
                                });
                              },
                            ),
                          ),
                        ).workaroundFreezeLinuxMint(),
                      )),
                row(
                    label: Text(
                      translate('Note'),
                      style: style,
                    ),
                    input: Obx(
                      () => TextField(
                        controller: noteController,
                        maxLines: 3,
                        minLines: 1,
                        maxLength: 300,
                        decoration: InputDecoration(
                          labelText: stateGlobal.isPortrait.isFalse
                              ? null
                              : translate('Note'),
                        ),
                      ).workaroundFreezeLinuxMint(),
                    )),
                if (gFFI.abModel.currentAbTags.isNotEmpty)
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      translate('Tags'),
                      style: style,
                    ),
                  ).marginOnly(top: 8, bottom: marginBottom),
                if (gFFI.abModel.currentAbTags.isNotEmpty)
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Wrap(
                      children: tags
                          .map((e) => AddressBookTag(
                              name: e,
                              tags: selectedTag,
                              onTap: () {
                                if (selectedTag.contains(e)) {
                                  selectedTag.remove(e);
                                } else {
                                  selectedTag.add(e);
                                }
                              },
                              showActionMenu: false))
                          .toList(growable: false),
                    ),
                  ),
              ],
            ),
            const SizedBox(
              height: 4.0,
            ),
            if (!gFFI.abModel.current.isPersonal())
              Row(children: [
                Icon(Icons.info, color: Colors.amber).marginOnly(right: 4),
                Text(
                  translate('share_warning_tip'),
                  style: TextStyle(fontSize: 12),
                )
              ]).marginSymmetric(vertical: 10),
            // NOT use Offstage to wrap LinearProgressIndicator
            if (isInProgress) const LinearProgressIndicator(),
          ],
        ),
        actions: [
          dialogButton("Cancel", onPressed: close, isOutline: true),
          dialogButton("OK", onPressed: submit),
        ],
        onSubmit: submit,
        onCancel: close,
      );
    });
  }

  void abAddTag() async {
    var field = "";
    var msg = "";
    var isInProgress = false;
    TextEditingController controller = TextEditingController(text: field);
    gFFI.dialogManager.show((setState, close, context) {
      submit() async {
        setState(() {
          msg = "";
          isInProgress = true;
        });
        field = controller.text.trim();
        if (field.isEmpty) {
          // pass
        } else {
          final tags = field.trim().split(RegExp(r"[\s,;\n]+"));
          field = tags.join(',');
          for (var t in [kUntagged, translate(kUntagged)]) {
            if (tags.contains(t)) {
              BotToast.showText(
                  contentColor: Colors.red, text: 'Tag name cannot be "$t"');
              isInProgress = false;
              return;
            }
          }
          gFFI.abModel.addTags(tags);
          // final currentPeers
        }
        close();
      }

      return CustomAlertDialog(
        title: Text(translate("Add Tag")),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(translate("whitelist_sep")),
            const SizedBox(
              height: 8.0,
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    maxLines: null,
                    decoration: InputDecoration(
                      errorText: msg.isEmpty ? null : translate(msg),
                    ),
                    controller: controller,
                    autofocus: true,
                  ).workaroundFreezeLinuxMint(),
                ),
              ],
            ),
            const SizedBox(
              height: 4.0,
            ),
            // NOT use Offstage to wrap LinearProgressIndicator
            if (isInProgress) const LinearProgressIndicator(),
          ],
        ),
        actions: [
          dialogButton("Cancel", onPressed: close, isOutline: true),
          dialogButton("OK", onPressed: submit),
        ],
        onSubmit: submit,
        onCancel: close,
      );
    });
  }
}

class AddressBookTag extends StatelessWidget {
  final String name;
  final RxList<dynamic> tags;
  final Function()? onTap;
  final bool showActionMenu;

  const AddressBookTag(
      {Key? key,
      required this.name,
      required this.tags,
      this.onTap,
      this.showActionMenu = true})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    var pos = RelativeRect.fill;

    void setPosition(TapDownDetails e) {
      final x = e.globalPosition.dx;
      final y = e.globalPosition.dy;
      pos = RelativeRect.fromLTRB(x, y, x, y);
    }

    const double radius = 8;
    final isUnTagged = name == kUntagged;
    final showAction = showActionMenu && !isUnTagged;
    return GestureDetector(
      onTap: onTap,
      onTapDown: showAction ? setPosition : null,
      onSecondaryTapDown: showAction ? setPosition : null,
      onSecondaryTap: showAction ? () => _showMenu(context, pos) : null,
      onLongPress: showAction ? () => _showMenu(context, pos) : null,
      child: Obx(() => Container(
            decoration: BoxDecoration(
                color: tags.contains(name)
                    ? gFFI.abModel.getCurrentAbTagColor(name)
                    : Theme.of(context).colorScheme.background,
                borderRadius: BorderRadius.circular(4)),
            margin: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 4.0),
            padding: const EdgeInsets.symmetric(vertical: 2.0, horizontal: 6.0),
            child: IntrinsicWidth(
              child: Row(
                children: [
                  if (!isUnTagged)
                    Container(
                      width: radius,
                      height: radius,
                      decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: tags.contains(name)
                              ? Colors.white
                              : gFFI.abModel.getCurrentAbTagColor(name)),
                    ).marginOnly(right: radius / 2),
                  Expanded(
                    child: Text(isUnTagged ? translate(name) : name,
                        style: TextStyle(
                            overflow: TextOverflow.ellipsis,
                            color: tags.contains(name) ? Colors.white : null)),
                  ),
                ],
              ),
            ),
          )),
    );
  }

  void _showMenu(BuildContext context, RelativeRect pos) {
    final items = [
      getEntry(translate("Rename"), () {
        renameDialog(
            oldName: name,
            validator: (String? newName) {
              if (newName == null || newName.isEmpty) {
                return translate('Can not be empty');
              }
              if (newName != name &&
                  gFFI.abModel.currentAbTags.contains(newName)) {
                return translate('Already exists');
              }
              return null;
            },
            onSubmit: (String newName) {
              if (name != newName) {
                gFFI.abModel.renameTag(name, newName);
              }
              Future.delayed(Duration.zero, () => Get.back());
            },
            onCancel: () {
              Future.delayed(Duration.zero, () => Get.back());
            });
      }),
      getEntry(translate(translate('Change Color')), () async {
        final model = gFFI.abModel;
        Color oldColor = model.getCurrentAbTagColor(name);
        Color newColor = await showColorPickerDialog(
          context,
          oldColor,
          pickersEnabled: {
            ColorPickerType.accent: false,
            ColorPickerType.wheel: true,
          },
          pickerTypeLabels: {
            ColorPickerType.primary: translate("Primary Color"),
            ColorPickerType.wheel: translate("HSV Color"),
          },
          actionButtons: ColorPickerActionButtons(
              dialogOkButtonLabel: translate("OK"),
              dialogCancelButtonLabel: translate("Cancel")),
          showColorCode: true,
        );
        if (oldColor != newColor) {
          model.setTagColor(name, newColor);
        }
      }),
      getEntry(translate("Delete"), () {
        gFFI.abModel.deleteTag(name);
        Future.delayed(Duration.zero, () => Get.back());
      }),
    ];

    mod_menu.showMenu(
      context: context,
      position: pos,
      items: items
          .map((e) => e.build(
              context,
              MenuConfig(
                  commonColor: CustomPopupMenuTheme.commonColor,
                  height: CustomPopupMenuTheme.height,
                  dividerHeight: CustomPopupMenuTheme.dividerHeight)))
          .expand((i) => i)
          .toList(),
      elevation: 8,
    );
  }
}

MenuEntryButton<String> getEntry(String title, VoidCallback proc) {
  return MenuEntryButton<String>(
    childBuilder: (TextStyle? style) => Text(
      title,
      style: style,
    ),
    proc: proc,
    dismissOnClicked: true,
  );
}
