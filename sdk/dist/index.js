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
import React, { createContext, useContext, useState, useEffect } from "react";
var PayMeContext = createContext(void 0);
var PayMeProvider = ({
  payme,
  children
}) => {
  const [client, setClient] = useState(null);
  useEffect(() => {
    if (payme instanceof Promise) {
      payme.then(setClient);
    } else {
      setClient(payme);
    }
  }, [payme]);
  return /* @__PURE__ */ React.createElement(PayMeContext.Provider, { value: client }, children);
};
var usePayMeContext = () => {
  const context = useContext(PayMeContext);
  if (context === void 0) {
    throw new Error("usePayMeContext must be used within a PayMeProvider");
  }
  return context;
};

// src/PayMeElement.tsx
import React2, { useEffect as useEffect2, useRef } from "react";
var PayMeElement = ({ onReady }) => {
  const client = usePayMeContext();
  const iframeRef = useRef(null);
  const appUrl = client?.config.appUrl ?? "http://localhost:3000";
  useEffect2(() => {
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
  return /* @__PURE__ */ React2.createElement("div", { style: { width: "100%", minHeight: "400px", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" } }, /* @__PURE__ */ React2.createElement(
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
export {
  PayMeClient,
  PayMeElement,
  PayMeProvider,
  loadPayMe,
  usePayMe,
  usePayMeContext
};
//# sourceMappingURL=index.js.map