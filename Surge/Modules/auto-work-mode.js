// auto-work-mode.js
// 自动根据 SSID 启用/禁用 work-mode 模块

const TARGET_SSID = "vbill-jishu";        // 目标 SSID（区分大小写）
const MODULE_NAME = "work-mode";   // 要控制的模块名

(async () => {
  try {
    const wifi = await $network.wifi;
    
    if (!wifi?.ssid) {
      $surge.setModuleState(MODULE_NAME, false);
      return $done();
    }

    const currentSSID = wifi.ssid.trim();
    const shouldEnable = currentSSID === TARGET_SSID;

    $surge.setModuleState(MODULE_NAME, shouldEnable);
    $done();
  } catch (err) {
    console.log(`[AutoWorkMode] Error: ${err}`);
    $surge.setModuleState(MODULE_NAME, false);
    $done();
  }
})();