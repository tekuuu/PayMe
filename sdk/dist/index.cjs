"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  PayMeClient: () => PayMeClient,
  PayMeElement: () => PayMeElement,
  PayMeProvider: () => PayMeProvider,
  loadPayMe: () => loadPayMe,
  usePayMe: () => usePayMe,
  usePayMeContext: () => usePayMeContext
});
module.exports = __toCommonJS(index_exports);

// src/loadPayMe.ts
var PayMeClient = class {
  config;
  constructor(config) {
    this.config = config;
  }
};
function loadPayMe(merchantAddress, network = "sepolia", appUrl = "http://localhost:3000") {
  return Promise.resolve(new PayMeClient({ merchantAddress, network, appUrl }));
}

// src/PayMeProvider.tsx
var import_react = __toESM(require("react"), 1);
var PayMeContext = (0, import_react.createContext)(void 0);
var PayMeProvider = ({
  payme,
  children
}) => {
  const [client, setClient] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (payme instanceof Promise) {
      payme.then(setClient);
    } else {
      setClient(payme);
    }
  }, [payme]);
  return /* @__PURE__ */ import_react.default.createElement(PayMeContext.Provider, { value: client }, children);
};
var usePayMeContext = () => {
  const context = (0, import_react.useContext)(PayMeContext);
  if (context === void 0) {
    throw new Error("usePayMeContext must be used within a PayMeProvider");
  }
  return context;
};

// src/PayMeElement.tsx
var import_react2 = __toESM(require("react"), 1);
var PayMeElement = ({ onReady }) => {
  const client = usePayMeContext();
  const iframeRef = (0, import_react2.useRef)(null);
  const appUrl = client?.config.appUrl ?? "http://localhost:3000";
  (0, import_react2.useEffect)(() => {
    const handleMessage = (event) => {
      if (event.origin !== appUrl) return;
      if (event.data?.type === "PAYME_IFRAME_READY") {
        onReady?.();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [appUrl, onReady]);
  if (!client) return null;
  return /* @__PURE__ */ import_react2.default.createElement("div", { style: { width: "100%", minHeight: "400px", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" } }, /* @__PURE__ */ import_react2.default.createElement(
    "iframe",
    {
      ref: iframeRef,
      id: "payme-element-iframe",
      src: `${appUrl}/embed/checkout?merchant=${client.config.merchantAddress}`,
      style: { width: "100%", height: "100%", minHeight: "400px", border: "none" },
      allow: "publickey-credentials-get *"
    }
  ));
};

// src/usePayMe.ts
var usePayMe = () => {
  const client = usePayMeContext();
  const appUrl = client?.config.appUrl ?? "http://localhost:3000";
  const confirmSubscription = async ({ amount }) => {
    return new Promise((resolve) => {
      if (!client) {
        return resolve({ error: new Error("PayMe client not initialized"), receipt: null });
      }
      const iframe = document.getElementById("payme-element-iframe");
      if (!iframe || !iframe.contentWindow) {
        return resolve({ error: new Error("PayMeElement not mounted"), receipt: null });
      }
      const handleMessage = (event) => {
        if (event.origin !== appUrl) return;
        if (event.data?.type === "SUBSCRIPTION_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          resolve({ error: null, receipt: event.data.receipt });
        } else if (event.data?.type === "SUBSCRIPTION_ERROR") {
          window.removeEventListener("message", handleMessage);
          resolve({ error: new Error(event.data.error), receipt: null });
        }
      };
      window.addEventListener("message", handleMessage);
      iframe.contentWindow.postMessage({
        type: "INITIATE_SUBSCRIPTION",
        payload: {
          merchantAddress: client.config.merchantAddress,
          amount
        }
      }, appUrl);
    });
  };
  return { confirmSubscription };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PayMeClient,
  PayMeElement,
  PayMeProvider,
  loadPayMe,
  usePayMe,
  usePayMeContext
});
//# sourceMappingURL=index.cjs.map