// surge-auto-work-on-ssid.js
const TARGET_SSID = "vbill-jishu";
const TARGET_MODULE = "公司模式"
const READ_DELAY_MS = 400;

function log(msg) { 
    console.log("[switch-work] " + msg); 
}
function safe(obj) { try { return JSON.stringify(obj); } catch { return String(obj); } }

function getSSID() {
  const env = (typeof $environment !== "undefined" && $environment && $environment.ssid) || "";
  const net = ($network && $network.wifi && $network.wifi.ssid) || "";
  log("ENV SSID=" + (env || "<empty>") + " NET SSID=" + (net || "<empty>"));
  return env || net || "";
}

function httpAPI(method, path, body) {
  return new Promise((resolve, reject) => {
    $httpAPI(method, path, body, (data) => {
      log(method + " " + path + " -> " + safe(data));
      resolve(typeof data === "string" ? (JSON.parse(data || "{}")) : data);
    });
  });
}

(async () => {
  try {
    await new Promise(r => setTimeout(r, READ_DELAY_MS));

    const ssid = getSSID();
    log("final SSID=" + (ssid || "<empty>"));
    const shouldEnable = ssid === TARGET_SSID;
    log("shouldEnable=" + shouldEnable);

    const mods = await httpAPI("GET", "v1/modules", null);
    const enabled = new Set(Array.isArray(mods.enabled) ? mods.enabled : []);
    const disabled = new Set(Array.isArray(mods.available) ? mods.available : []);
    const all = new Set([...enabled, ...disabled]);

    log("mods enabled=" + safe([...enabled]) + " disabled=" + safe([...disabled]));

    if (!all.has(TARGET_MODULE)) {
      log("module not found: " + TARGET_MODULE + " (检查模块名称是否完全一致)");
      $done();
      return;
    }

    const isEnabled = enabled.has(TARGET_MODULE);
    log("isEnabled=" + isEnabled);

    if (shouldEnable && !isEnabled) {
      await httpAPI("POST", "v1/modules", { [TARGET_MODULE]: true });
      log("enabled: " + TARGET_MODULE + " for SSID=" + ssid);
    } else if (!shouldEnable && isEnabled) {
      await httpAPI("POST", "v1/modules", { [TARGET_MODULE]: false });
      log("disabled: " + TARGET_MODULE + " (SSID=" + (ssid || "<empty>") + ")");
    } else {
      log("no change");
    }
    $done();
  } catch (e) {
    log("error=" + (e && e.stack ? e.stack : String(e)));
    $done();
  }
})();
