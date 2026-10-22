/**
 * OpenWrt 智能编译工具 - 配置数据
 *
 * 设备/源码 ID 必须与 .github/workflows/smart-build.yml 中的
 * workflow_dispatch.inputs 保持一致，否则前端传过去的值匹配不到 case。
 *
 * 当前支持的设备（5 个）：
 *   x86_64           → x86/64
 *   x86_32           → x86/legacy
 *   hiwifi_c526a     → ipq40xx/generic（需 shebei-dts/c526a-*.patch）
 *   jcg860m          → 待开发
 *   asus_rt_acrh17   → ipq40xx/generic（OpenWrt 原生支持）
 *
 * 当前支持的源码（5 个）：
 *   openwrt-main     → openwrt-25.12
 *   openwrt-2410     → openwrt-24.10
 *   lede-master      → Lean's LEDE master
 *   immortalwrt-master → ImmortalWrt master
 *   Lienol-master    → Lienol 21.02
 */

// ===== 基础配置 =====
const GITHUB_REPO = 'lovepzz/wangyegoujian'; // 替换为你自己的仓库地址

// ===== Token 管理 =====
let GITHUB_TOKEN = null;

function getGitHubToken() {
  // 1) URL 参数（开发调试）
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) return urlToken;

  // 2) localStorage（网页输入保存）
  const stored = localStorage.getItem('github_token');
  if (stored) return stored;

  // 3) window.GITHUB_TOKEN（index.html 硬编码注入）
  if (window.GITHUB_TOKEN) return window.GITHUB_TOKEN;

  return null;
}

function setGitHubToken(token) {
  if (token && token.trim()) {
    GITHUB_TOKEN = token.trim();
    if (confirm('是否保存 Token 到浏览器本地存储？\n（建议仅在个人设备上选择是）')) {
      localStorage.setItem('github_token', GITHUB_TOKEN);
    }
    return true;
  }
  return false;
}

function clearGitHubToken() {
  GITHUB_TOKEN = null;
  localStorage.removeItem('github_token');
  delete window.GITHUB_TOKEN;
}

function hasValidToken() {
  const token = getGitHubToken();
  if (!token) return false;
  return token.startsWith('ghp_') || token.startsWith('github_pat_');
}

// ===== 源码分支配置 =====
// 与 workflow 的 source_branch 选项一一对应
const SOURCE_BRANCHES = {
  'openwrt-main': {
    name: 'OpenWrt 官方 (25.12)',
    description: '最新稳定分支，C526A 使用 25.12 补丁',
    repo: 'https://github.com/openwrt/openwrt',
    branch: 'openwrt-25.12',
    recommended: true,
    stability: '高',
    plugins: '基础',
    // 支持的设备（用于前端做兼容性约束）
    compatible_devices: ['x86_64', 'x86_32', 'hiwifi_c526a', 'asus_rt_acrh17']
  },
  'openwrt-2410': {
    name: 'OpenWrt 官方 (24.10)',
    description: 'C526A 使用 24.10 补丁，兼容性成熟',
    repo: 'https://github.com/openwrt/openwrt',
    branch: 'openwrt-24.10',
    recommended: true,
    stability: '高',
    plugins: '基础',
    compatible_devices: ['x86_64', 'x86_32', 'hiwifi_c526a', 'asus_rt_acrh17']
  },
  'lede-master': {
    name: "Lean's LEDE",
    description: '国内热门分支，集成大量插件',
    repo: 'https://github.com/coolsnowwolf/lede',
    branch: 'master',
    recommended: false,
    stability: '中',
    plugins: '丰富',
    // 没有 C526A DTS 目录，只能用 x86
    compatible_devices: ['x86_64', 'x86_32']
  },
  'immortalwrt-master': {
    name: 'ImmortalWrt',
    description: '增强版官方固件，适合 X86',
    repo: 'https://github.com/immortalwrt/immortalwrt',
    branch: 'master',
    recommended: false,
    stability: '中',
    plugins: '增强',
    compatible_devices: ['x86_64', 'x86_32']
  },
  'Lienol-master': {
    name: 'Lienol',
    description: 'Lienol 21.02，旧内核，仅 X86',
    repo: 'https://github.com/Lienol/openwrt',
    branch: '22.03',
    recommended: false,
    stability: '中',
    plugins: '丰富',
    compatible_devices: ['x86_64', 'x86_32']
  }
};

// ===== 设备配置 =====
const DEVICE_CONFIGS = {
  // ===== X86 设备 =====
  'x86_64': {
    name: 'X86 64 位（通用）',
    category: 'x86',
    arch: 'x86',
    target: 'x86/64',
    profile: 'generic',
    flash_size: '可变',
    ram_size: '可变',
    recommended: true,
    stability: 'stable',
    features: ['efi', 'legacy', 'kvm', 'docker'],
    compatible_sources: ['openwrt-main', 'openwrt-2410', 'lede-master', 'immortalwrt-master', 'Lienol-master']
  },
  'x86_32': {
    name: 'X86 32 位（兼容）',
    category: 'x86',
    arch: 'x86',
    target: 'x86/legacy',
    profile: 'generic',
    flash_size: '可变',
    ram_size: '可变',
    recommended: false,
    stability: 'stable',
    features: ['legacy'],
    compatible_sources: ['openwrt-main', 'openwrt-2410', 'lede-master', 'immortalwrt-master', 'Lienol-master']
  },

  // ===== IPQ40xx 设备 =====
  'hiwifi_c526a': {
    name: 'HiWiFi C526A (极路由X)',
    category: 'router',
    arch: 'ipq40xx',
    target: 'ipq40xx/generic',
    profile: 'hiwifi_c526a',
    flash_size: '128M',
    ram_size: '512M',
    recommended: true,
    stability: 'beta',      // 25.12 上无线启动仍有回归
    features: ['wifi', 'gigabit', 'usb', 'tri-band'],
    // 只有 25.12 和 24.10 有对应的补丁和 DTS 目录
    compatible_sources: ['openwrt-main', 'openwrt-2410'],
    // C526A 专属推荐插件（会与用户在网页上选的插件合并去重）
    recommended_plugins: [
      'luci-app-firewall',
      'luci-app-opkg',
      'luci-app-advancedplus',   // kiddin9 进阶设置
      'usteer',
      'luci-app-usteer',
      'luci-i18n-base-zh-cn'
    ],
    warnings: [
      '⚠️ WiFi 默认不自动开启，刷机后需手动在 LuCI 或 SSH 中启用',
      '⚠️ 25.12 上 MT7615 存在软重启后 2.4G 起不来的已知问题'
    ]
  },
  'asus_rt_acrh17': {
    name: '华硕 RT-ACRH17',
    category: 'router',
    arch: 'ipq40xx',
    target: 'ipq40xx/generic',
    profile: 'asus_rt-acrh17',
    flash_size: '128M',
    ram_size: '256M',
    recommended: true,
    stability: 'stable',
    features: ['wifi', 'gigabit', 'usb'],
    // OpenWrt 原生支持，所有 24.10/25.12 源码都能用
    compatible_sources: ['openwrt-main', 'openwrt-2410'],
    recommended_plugins: [
      'luci-app-firewall',
      'luci-app-opkg',
      'luci-i18n-base-zh-cn'
    ]
  },
  'jcg860m': {
    name: 'JCG 860M（待开发）',
    category: 'router',
    arch: 'ramips',
    target: 'ramips/mt7621',
    profile: 'jcg_860m',
    flash_size: '16M',
    ram_size: '256M',
    recommended: false,
    stability: 'unsupported',
    features: ['wifi', 'gigabit'],
    // 目前只生成 ramips 通用目标，无法直接刷入
    compatible_sources: ['openwrt-main', 'openwrt-2410', 'lede-master'],
    recommended_plugins: ['luci'],
    warnings: [
      '❌ 设备 DTS 尚未集成，产物为 ramips 通用镜像，不能直接刷入 JCG 860M',
      '❌ 请勿用于实际设备，仅用于开发验证'
    ]
  }
};

// ===== 插件配置 =====
const PLUGIN_CONFIGS = {
  proxy: {
    name: '🔐 网络代理',
    plugins: {
      'luci-app-ssr-plus': {
        name: 'SSR Plus+',
        description: 'ShadowsocksR 代理工具',
        conflicts: ['luci-app-passwall', 'luci-app-openclash'],
        size: '5M',
        stability: 'stable'
      },
      'luci-app-passwall': {
        name: 'PassWall',
        description: '多协议代理，智能分流',
        conflicts: ['luci-app-ssr-plus', 'luci-app-openclash'],
        size: '8M',
        stability: 'stable'
      },
      'luci-app-openclash': {
        name: 'OpenClash',
        description: 'Clash 客户端，规则订阅',
        conflicts: ['luci-app-ssr-plus', 'luci-app-passwall'],
        requires: ['ca-certificates'],
        size: '12M',
        stability: 'beta'
      }
    }
  },

  network: {
    name: '🌐 网络工具',
    plugins: {
      'luci-app-adguardhome': {
        name: 'AdGuard Home',
        description: 'DNS 广告拦截',
        conflicts: ['luci-app-adbyby-plus'],
        size: '15M',
        stability: 'stable'
      },
      'luci-app-adbyby-plus': {
        name: 'AdByby Plus+',
        description: '广告过滤',
        conflicts: ['luci-app-adguardhome'],
        size: '3M',
        stability: 'stable'
      },
      'luci-app-ddns': {
        name: '动态 DNS',
        description: '域名解析服务',
        size: '1M',
        stability: 'stable'
      },
      'luci-app-upnp': {
        name: 'UPnP',
        description: '端口自动映射',
        size: '0.5M',
        stability: 'stable'
      }
    }
  },

  system: {
    name: '⚙️ 系统管理',
    plugins: {
      'luci-app-dockerman': {
        name: 'Docker CE',
        description: '容器服务管理',
        requires: ['docker-ce'],
        arch_limit: ['x86', 'arm64'],
        size: '50M',
        stability: 'stable'
      },
      'luci-app-ttyd': {
        name: 'TTYD 终端',
        description: 'Web 终端访问',
        size: '1M',
        stability: 'stable'
      },
      'luci-app-wol': {
        name: '网络唤醒',
        description: '远程开机',
        size: '0.5M',
        stability: 'stable'
      },
      'luci-app-netdata': {
        name: '实时监控',
        description: '系统性能监控',
        size: '5M',
        stability: 'stable'
      },
      // C526A 专属
      'luci-app-advancedplus': {
        name: '进阶设置（kiddin9）',
        description: '功能聚合面板，C526A 推荐',
        size: '3M',
        stability: 'stable'
      },
      'usteer': {
        name: 'usteer 漫游',
        description: '802.11k/v/r 客户端引导，多 AP 场景',
        size: '0.5M',
        stability: 'stable'
      }
    }
  },

  media: {
    name: '🎵 多媒体服务',
    plugins: {
      'luci-app-aria2': {
        name: 'Aria2',
        description: '多线程下载',
        size: '8M',
        stability: 'stable'
      },
      'luci-app-transmission': {
        name: 'Transmission',
        description: 'BT 下载',
        conflicts: ['luci-app-qbittorrent'],
        size: '10M',
        stability: 'stable'
      },
      'luci-app-samba4': {
        name: 'Samba4',
        description: '文件共享',
        size: '15M',
        stability: 'stable'
      },
      'luci-app-minidlna': {
        name: 'DLNA 服务器',
        description: '媒体流服务',
        size: '5M',
        stability: 'stable'
      }
    }
  }
};

// ===== 冲突检测规则 =====
const CONFLICT_RULES = {
  proxy_mutual_exclusive: [
    ['luci-app-ssr-plus', 'luci-app-passwall', 'luci-app-openclash']
  ],
  adblock_mutual_exclusive: [
    ['luci-app-adguardhome', 'luci-app-adbyby-plus']
  ],
  download_mutual_exclusive: [
    ['luci-app-transmission', 'luci-app-qbittorrent']
  ],
  arch_restrictions: {
    'luci-app-dockerman': ['x86', 'arm64'],
    'luci-app-kvm': ['x86']
  },
  // 按 Flash 容量限制可选插件数量（同时作用于检测）
  storage_limits: {
    '8M': 2,
    '16M': 5,
    '32M': 10,
    '128M': 30,   // C526A / RT-ACRH17
    'SD': 50,
    '可变': 50     // X86
  }
};

// ===== 编译选项（前端可能直接引用）=====
const BUILD_OPTIONS = {
  optimization: {
    name: '编译优化',
    options: {
      'size': {
        name: '体积优化',
        description: '最小化固件体积，适合存储有限的设备',
        flags: ['CONFIG_USE_MUSL=y', 'CONFIG_STRIP_KERNEL_EXPORTS=y']
      },
      'performance': {
        name: '性能优化',
        description: '优化运行性能，适合高性能设备',
        flags: ['CONFIG_DEVEL=y', 'CONFIG_CCACHE=y']
      },
      'debug': {
        name: '调试版本',
        description: '包含调试信息，便于问题排查',
        flags: ['CONFIG_DEBUG=y', 'CONFIG_NO_STRIP=y']
      }
    }
  },
  features: {
    name: '功能特性',
    options: {
      'ipv6': {
        name: 'IPv6 支持',
        description: '启用 IPv6 网络支持',
        default: true
      },
      'wifi': {
        name: '无线功能',
        description: '启用 WiFi 驱动和管理界面',
        device_dependent: true
      },
      'usb': {
        name: 'USB 支持',
        description: '启用 USB 设备支持',
        device_dependent: true
      }
    }
  }
};

// ===== 工具函数 =====

/**
 * 获取设备推荐配置
 * 返回设备对象、推荐插件、优化模式、警告列表
 */
function getDeviceRecommendedConfig(deviceId) {
  const device = DEVICE_CONFIGS[deviceId];
  if (!device) return null;

  return {
    device: device,
    recommended_plugins: getRecommendedPlugins(device),
    optimization: getRecommendedOptimization(device),
    warnings: getDeviceWarnings(device)
  };
}

/**
 * 计算设备推荐插件
 * 优先用设备自带的 recommended_plugins；如果没有，按特性推导
 */
function getRecommendedPlugins(device) {
  // 优先使用设备定义里的显式推荐
  if (Array.isArray(device.recommended_plugins) && device.recommended_plugins.length > 0) {
    return device.recommended_plugins.slice();
  }

  const recommended = [];

  // 所有设备都给基础 LuCI
  recommended.push('luci', 'luci-i18n-base-zh-cn');

  if (device.features && device.features.includes('wifi')) {
    recommended.push('luci-app-ddns');
  }

  if (device.flash_size !== '8M') {
    recommended.push('luci-app-upnp', 'luci-app-ttyd');
  }

  if (device.category === 'x86') {
    recommended.push('luci-app-dockerman', 'luci-app-netdata');
  }

  return recommended;
}

/**
 * 推荐编译优化模式
 */
function getRecommendedOptimization(device) {
  if (device.flash_size === '8M' || device.flash_size === '16M') {
    return 'size';
  }
  if (device.category === 'x86') {
    return 'performance';
  }
  return 'balanced';
}

/**
 * 计算设备警告
 * 修掉之前 device.stability 检查失效的问题（现在字段存在了）
 * 同时把设备自带的 warnings 追加进来
 */
function getDeviceWarnings(device) {
  const warnings = [];

  if (device.flash_size === '8M') {
    warnings.push('⚠️ 存储空间较小，建议选择必要插件');
  }

  // 设备自定义警告（比如 C526A 的 WiFi 不自动开）
  if (Array.isArray(device.warnings)) {
    warnings.push.apply(warnings, device.warnings);
  }

  // 兼容性状态警告
  if (device.stability === 'beta') {
    warnings.push('⚠️ 该设备支持处于测试阶段，部分功能可能不稳定');
  }
  if (device.stability === 'unsupported') {
    warnings.push('❌ 该设备尚待开发，产物不可直接使用');
  }

  if (device.recommended === false) {
    warnings.push('⚠️ 非推荐设备，可能存在兼容性问题');
  }

  return warnings;
}

/**
 * 检测插件冲突（互斥组）
 */
function detectPluginConflicts(selectedPlugins) {
  const conflicts = [];

  Object.entries(CONFLICT_RULES).forEach(([ruleName, rules]) => {
    if (!ruleName.includes('mutual_exclusive')) return;
    rules.forEach(group => {
      const hit = group.filter(p => selectedPlugins.includes(p));
      if (hit.length > 1) {
        conflicts.push({
          type: 'mutual_exclusive',
          plugins: hit,
          message: '插件冲突：' + hit.join(', ') + ' 不能同时选择'
        });
      }
    });
  });

  return conflicts;
}

/**
 * 检查架构兼容性
 * 使用 CONFLICT_RULES.arch_restrictions
 */
function checkArchCompatibility(selectedPlugins, deviceArch) {
  const incompatible = [];

  selectedPlugins.forEach(plugin => {
    const restrictions = CONFLICT_RULES.arch_restrictions[plugin];
    if (restrictions && !restrictions.includes(deviceArch)) {
      incompatible.push({
        plugin: plugin,
        supported_arch: restrictions,
        current_arch: deviceArch
      });
    }
  });

  return incompatible;
}

/**
 * 新增：检查设备-源码兼容性
 * 用于前端在选择源码后过滤掉不兼容的设备，或在开始编译前阻止
 * 例如 C526A 只能配合 openwrt-main / openwrt-2410
 */
function checkDeviceSourceCompatibility(deviceId, sourceId) {
  const device = DEVICE_CONFIGS[deviceId];
  const source = SOURCE_BRANCHES[sourceId];
  if (!device || !source) {
    return { compatible: false, reason: '未知设备或源码' };
  }

  // 双向检查：设备声明支持该源码，或源码声明支持该设备
  const deviceOk = Array.isArray(device.compatible_sources) && device.compatible_sources.includes(sourceId);
  const sourceOk = Array.isArray(source.compatible_devices) && source.compatible_devices.includes(deviceId);

  if (deviceOk || sourceOk) {
    return { compatible: true };
  }

  return {
    compatible: false,
    reason: '设备 ' + device.name + ' 不支持源码 ' + source.name
  };
}

/**
 * 新增：根据 Flash 容量估算是否超出插件数量
 */
function checkStorageLimit(deviceId, selectedPlugins) {
  const device = DEVICE_CONFIGS[deviceId];
  if (!device) return { exceeded: false };

  const limit = CONFLICT_RULES.storage_limits[device.flash_size];
  if (typeof limit !== 'number') return { exceeded: false };

  return {
    exceeded: selectedPlugins.length > limit,
    limit: limit,
    current: selectedPlugins.length,
    flash_size: device.flash_size
  };
}

// ===== 导出到 window（保持与其他脚本兼容）=====
window.GITHUB_REPO = GITHUB_REPO;
window.getGitHubToken = getGitHubToken;
window.setGitHubToken = setGitHubToken;
window.clearGitHubToken = clearGitHubToken;
window.hasValidToken = hasValidToken;

window.SOURCE_BRANCHES = SOURCE_BRANCHES;
window.DEVICE_CONFIGS = DEVICE_CONFIGS;
window.PLUGIN_CONFIGS = PLUGIN_CONFIGS;
window.CONFLICT_RULES = CONFLICT_RULES;
window.BUILD_OPTIONS = BUILD_OPTIONS;

window.getDeviceRecommendedConfig = getDeviceRecommendedConfig;
window.detectPluginConflicts = detectPluginConflicts;
window.checkArchCompatibility = checkArchCompatibility;
window.checkDeviceSourceCompatibility = checkDeviceSourceCompatibility; // 新增
window.checkStorageLimit = checkStorageLimit;                         // 新增
