(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/Documents_zama_merces-front2_3f1ee4cb._.js",
"[project]/Documents/zama/merces-front2/src/instrumentation.ts [instrumentation-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "onRequestError",
    ()=>onRequestError,
    "register",
    ()=>register
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$common$2f$captureRequestError$2e$js__$5b$instrumentation$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/nextjs/build/esm/common/captureRequestError.js [instrumentation-edge] (ecmascript)");
;
const sentryOptions = {
    // Sentry DSN
    dsn: ("TURBOPACK compile-time value", ""),
    // Enable Spotlight in development
    spotlight: ("TURBOPACK compile-time value", "development") === 'development',
    // Adds request headers and IP for users, for more info visit
    sendDefaultPii: true,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false
};
async function register() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
}
const onRequestError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$common$2f$captureRequestError$2e$js__$5b$instrumentation$2d$edge$5d$__$28$ecmascript$29$__["captureRequestError"];
}),
"[project]/Documents/zama/merces-front2/edge-wrapper.js { MODULE => \"[project]/Documents/zama/merces-front2/src/instrumentation.ts [instrumentation-edge] (ecmascript)\" } [instrumentation-edge] (ecmascript)", ((__turbopack_context__, module, exports) => {

self._ENTRIES ||= {};
const modProm = Promise.resolve().then(()=>__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/instrumentation.ts [instrumentation-edge] (ecmascript)"));
modProm.catch(()=>{});
self._ENTRIES["middleware_instrumentation"] = new Proxy(modProm, {
    get (modProm, name) {
        if (name === "then") {
            return (res, rej)=>modProm.then(res, rej);
        }
        let result = (...args)=>modProm.then((mod)=>(0, mod[name])(...args));
        result.then = (res, rej)=>modProm.then((mod)=>mod[name]).then(res, rej);
        return result;
    }
});
}),
]);

//# sourceMappingURL=Documents_zama_merces-front2_3f1ee4cb._.js.map