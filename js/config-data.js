/**
 * OpenWrt 智能编译工具 - 配置数据
 * 安全版本 - 不包含敏感信息
 */

// ===== 基础配置 =====
const GITHUB_REPO = 'lovepzz/wangyegoujian'; // 替换为你的仓库地址

// ===== Token 管理 =====
let GITHUB_TOKEN = null;

function getGitHubToken() {
  // 1) URL 参数
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) return urlToken;

  // 2) localStorage
  const stored = localStorage.getItem('github_token');
  if (stored) return stored;

  // 3) window.GITHUB_TOKEN
  if (window.GITHUB_TOKEN) return window.GITHUB_TOKEN;

  return null;
}

function setGitHubToken(token) {
  if (token && token.trim()) {
    GITHUB_TOKEN = token.trim();
    if (confirm('是否保存Token到浏览器本地存储？\n（建议仅在个人设备上选择是）')) {
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

// 修复运算符优先级 bug
function hasValidToken() {
  const token = getGitHubToken();
  if (!token) return false;
  return token.startsWith('ghp_') || token.startsWith('github_pat_');
}

// ===== 源码分支配置（唯一一份，不重复声明） =====
const SOURCE_BRANCHES = {
  'openwrt-main': {
    name: 'OpenWrt 官方 (25.12)',
    description: '最新稳定版本，兼容性最好',
    repo: 'https://github.com/openwrt/openwrt',
    branch: 'openwrt-25.12',
    recommended: true,
    stability: '高',
    plugins: '基础'
  },
  'openwrt-2410': {
    name: 'OpenWrt 官方 (24.10)',
    description: '较新的稳定分支，C526A 等 IPQ40xx 设备支持良好',
    repo: 'https://github.com/openwrt/openwrt',
    branch: 'openwrt-24.10',
    recommended: true,
    stability: '高',
    plugins: '基础'
  },
  'lede-master': {
    name: "Lean's LEDE",
    description: '国内热门分支，集成大量插件',
    repo: 'https://github.com/coolsnowwolf/lede',
    branch: 'master',
    recommended: true,
    stability: '中',
    plugins: '丰富'
  },
  'immortalwrt-master': {
    name: 'ImmortalWrt',
    description: '增强版官方固件',
    repo: 'https://github.com/immortalwrt/immortalwrt',
    branch: 'openwrt-23.05',
    recommended: false,
    stability: '中',
    plugins: '增强'
  },
  'lienol-dev': {
    name: 'Lienol (开发版)',
    description: '功能激进，集成 Passwall 等插件，适合尝鲜用户',
    repo: 'https://github.com/Lienol/openwrt',
    branch: 'dev-master',
    recommended: false,
    stability: '中',
    plugins: '丰富'
  },
  'lienol-stable': {
    name: 'Lienol (稳定版)',
    description: '基于官方稳定版定制，注重稳定性与性能优化',
    repo: 'https://github.com/Lienol/openwrt',
    branch: '21.02',
    recommended: true,
    stability: '高',
    plugins: '基础'
  }
};

// ===== 设备配置 =====
const DEVICE_CONFIGS = {
  // 极路由X / HiWiFi C526A
  'hiwifi_c526a': {
    name: 'HiWiFi C526A (极路由X)',
    category: 'router',
    arch: 'ipq40xx',
    target: 'ipq40xx/generic',
    profile: 'hiwifi_c526a',
    flash_size: '128M',
    ram_size: '512M',
    recommended: false,
    features: ['wifi', 'gigabit', 'usb', 'tri-band']
  },

  // 路由器设备
  'xiaomi_4a_gigabit': {
    name: '小米路由器4A千兆版',
    category: 'router',
    arch: 'ramips',
    target: 'ramips/mt7621',
    profile: 'xiaomi_mi-router-4a-gigabit',
    flash_size: '16M',
    ram_size: '128M',
    recommended: true,
    features: ['wifi', 'gigabit', 'usb']
  },
  'newifi_d2': {
    name: '新路由3 (Newifi D2)',
    category: 'router',
    arch: 'ramips',
    target: 'ramips/mt7621',
    profile: 'newifi-d2',
    flash_size: '32M',
    ram_size: '512M',
    recommended: true,
    features: ['wifi', 'gigabit', 'usb']
  },
  'phicomm_k2p': {
    name: '斐讯K2P',
    category: 'router',
    arch: 'ramips',
    target: 'ramips/mt7621',
    profile: 'phicomm_k2p',
    flash_size: '16M',
    ram_size: '128M',
    recommended: false,
    features: ['wifi', 'gigabit']
  },

  // ARM 设备
  'rpi_4b': {
    name: '树莓派4B',
    category: 'arm',
    arch: 'bcm27xx',
    target: 'bcm27xx/bcm2711',
    profile: 'rpi-4',
    flash_size: 'SD',
    ram_size: '1G-8G',
    recommended: true,
    features: ['wifi', 'bluetooth', 'gpio', 'usb3']
  },
  'nanopi_r2s': {
    name: 'NanoPi R2S',
    category: 'arm',
    arch: 'rockchip',
    target: 'rockchip/armv8',
    profile: 'friendlyarm_nanopi-r2s',
    flash_size: 'SD',
    ram_size: '1G',
    recommended: true,
    features: ['gigabit', 'dual_ethernet']
  },

  // X86 设备
  'x86_64': {
    name: 'X86 64位 (通用)',
    category: 'x86',
    arch: 'x86',
    target: 'x86/64',
    profile: 'generic',
    flash_size: '可变',
    ram_size: '可变',
    recommended: true,
    features: ['efi', 'legacy', 'kvm', 'docker']
  },
  'x86_legacy': {
    name: 'X86 32位 (兼容)',
    category: 'x86',
    arch: 'x86',
    target: 'x86/legacy',
    profile: 'generic',
    flash_size: '可变',
    ram_size: '可变',
    recommended: false,
    features: ['legacy']
  }
};

// ===== 插件配置 =====
const PLUGIN_CONFIGS = {
  proxy: {
    name: '🔐 网络代理',
    plugins: {
      'luci-app-ssr-plus': {
        name: 'SSR Plus+',
        description: 'ShadowsocksR代理工具',
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
        description: 'Clash客户端，规则订阅',
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
        description: 'DNS广告拦截',
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
        name: '动态DNS',
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
        name: 'TTYD终端',
        description: 'Web终端访问',
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
        description: 'BT下载',
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
        name: 'DLNA服务器',
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

  storage_limits: {
    '8M': 2,
    '16M': 5,
    '32M': 10,
    '128M': 30,   // C526A
    'SD': 50
  }
};

// ===== 编译选项 =====
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
        name: 'IPv6支持',
        description: '启用IPv6网络支持',
        default: true
      },
      'wifi': {
        name: '无线功能',
        description: '启用WiFi驱动和管理界面',
        device_dependent: true
      },
      'usb': {
        name: 'USB支持',
        description: '启用USB设备支持',
        device_dependent: true
      }
    }
  }
};

// ===== 工具函数 =====

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

function getRecommendedPlugins(device) {
  const recommended = [];

  if (device.features?.includes('wifi')) {
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

function getRecommendedOptimization(device) {
  if (device.flash_size === '8M' || device.flash_size === '16M') {
    return 'size';
  } else if (device.category === 'x86') {
    return 'performance';
  }
  return 'balanced';
}

function getDeviceWarnings(device) {
  const warnings = [];

  if (device.flash_size === '8M') {
    warnings.push('⚠️ 存储空间较小，建议选择必要插件');
  }

  if (device.stability === 'beta') {
    warnings.push('⚠️ 该设备支持处于测试阶段');
  }

  if (!device.recommended) {
    warnings.push('⚠️ 非推荐设备，可能存在兼容性问题');
  }

  return warnings;
}

function detectPluginConflicts(selectedPlugins) {
  const conflicts = [];

  Object.entries(CONFLICT_RULES).forEach(([ruleName, rules]) => {
    if (ruleName.includes('mutual_exclusive')) {
      rules.forEach(group => {
        const conflictingPlugins = group.filter(plugin =>
          selectedPlugins.includes(plugin)
        );

        if (conflictingPlugins.length > 1) {
          conflicts.push({
            type: 'mutual_exclusive',
            plugins: conflictingPlugins,
            message: `插件冲突：${conflictingPlugins.join(', ')} 不能同时选择`
          });
        }
      });
    }
  });

  return conflicts;
}

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

// ===== 导出到 window =====
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
