(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/zama/merces-front2/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
exports._ = _interop_require_default;
}),
"[project]/Documents/zama/merces-front2/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
exports._ = _interop_require_wildcard;
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/helpers.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WINDOW",
    ()=>WINDOW,
    "getHttpRequestData",
    ()=>getHttpRequestData,
    "ignoreNextOnError",
    ()=>ignoreNextOnError,
    "shouldIgnoreOnError",
    ()=>shouldIgnoreOnError,
    "wrap",
    ()=>wrap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/misc.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$exports$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/exports.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/browser.js [app-client] (ecmascript)");
;
const WINDOW = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
let ignoreOnError = 0;
/**
 * @hidden
 */ function shouldIgnoreOnError() {
    return ignoreOnError > 0;
}
/**
 * @hidden
 */ function ignoreNextOnError() {
    // onerror should trigger before setTimeout
    ignoreOnError++;
    setTimeout(()=>{
        ignoreOnError--;
    });
}
// eslint-disable-next-line @typescript-eslint/ban-types
/**
 * Instruments the given function and sends an event to Sentry every time the
 * function throws an exception.
 *
 * @param fn A function to wrap. It is generally safe to pass an unbound function, because the returned wrapper always
 * has a correct `this` context.
 * @returns The wrapped function.
 * @hidden
 */ function wrap(fn, options = {}) {
    // for future readers what this does is wrap a function and then create
    // a bi-directional wrapping between them.
    //
    // example: wrapped = wrap(original);
    //  original.__sentry_wrapped__ -> wrapped
    //  wrapped.__sentry_original__ -> original
    function isFunction(fn) {
        return typeof fn === 'function';
    }
    if (!isFunction(fn)) {
        return fn;
    }
    try {
        // if we're dealing with a function that was previously wrapped, return
        // the original wrapper.
        const wrapper = fn.__sentry_wrapped__;
        if (wrapper) {
            if (typeof wrapper === 'function') {
                return wrapper;
            } else {
                // If we find that the `__sentry_wrapped__` function is not a function at the time of accessing it, it means
                // that something messed with it. In that case we want to return the originally passed function.
                return fn;
            }
        }
        // We don't wanna wrap it twice
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOriginalFunction"])(fn)) {
            return fn;
        }
    } catch  {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        // Bail on wrapping and return the function as-is (defers to window.onerror).
        return fn;
    }
    // Wrap the function itself
    // It is important that `sentryWrapped` is not an arrow function to preserve the context of `this`
    const sentryWrapped = function(...args) {
        try {
            // Also wrap arguments that are themselves functions
            const wrappedArguments = args.map((arg)=>wrap(arg, options));
            // Attempt to invoke user-land function
            // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
            //       means the sentry.javascript SDK caught an error invoking your application code. This
            //       is expected behavior and NOT indicative of a bug with sentry.javascript.
            return fn.apply(this, wrappedArguments);
        } catch (ex) {
            ignoreNextOnError();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withScope"])((scope)=>{
                scope.addEventProcessor((event)=>{
                    if (options.mechanism) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addExceptionTypeValue"])(event, undefined, undefined);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addExceptionMechanism"])(event, options.mechanism);
                    }
                    event.extra = {
                        ...event.extra,
                        arguments: args
                    };
                    return event;
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$exports$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["captureException"])(ex);
            });
            throw ex;
        }
    };
    // Wrap the wrapped function in a proxy, to ensure any other properties of the original function remain available
    try {
        for(const property in fn){
            if (Object.prototype.hasOwnProperty.call(fn, property)) {
                sentryWrapped[property] = fn[property];
            }
        }
    } catch  {
    // Accessing some objects may throw
    // ref: https://github.com/getsentry/sentry-javascript/issues/1168
    }
    // Signal that this function has been wrapped/filled already
    // for both debugging and to prevent it to being wrapped/filled twice
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markFunctionWrapped"])(sentryWrapped, fn);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(fn, '__sentry_wrapped__', sentryWrapped);
    // Restore original function name (not all browsers allow that)
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name');
        if (descriptor.configurable) {
            Object.defineProperty(sentryWrapped, 'name', {
                get () {
                    return fn.name;
                }
            });
        }
    } catch  {
    // This may throw if e.g. the descriptor does not exist, or a browser does not allow redefining `name`.
    // to save some bytes we simply try-catch this
    }
    return sentryWrapped;
}
/**
 * Get HTTP request data from the current page.
 */ function getHttpRequestData() {
    // grab as much info as exists and add it to the event
    const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocationHref"])();
    const { referrer } = WINDOW.document || {};
    const { userAgent } = WINDOW.navigator || {};
    const headers = {
        ...referrer && {
            Referer: referrer
        },
        ...userAgent && {
            'User-Agent': userAgent
        }
    };
    const request = {
        url,
        headers
    };
    return request;
}
;
 //# sourceMappingURL=helpers.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/debug-build.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */ __turbopack_context__.s([
    "DEBUG_BUILD",
    ()=>DEBUG_BUILD
]);
const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__;
;
 //# sourceMappingURL=debug-build.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/backgroundtab.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "registerBackgroundTabDetection",
    ()=>registerBackgroundTabDetection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/spanUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$spanstatus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/spanstatus.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/helpers.js [app-client] (ecmascript)");
;
;
;
/**
 * Add a listener that cancels and finishes a transaction when the global
 * document is hidden.
 */ function registerBackgroundTabDetection() {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].document) {
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].document.addEventListener('visibilitychange', ()=>{
            const activeSpan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActiveSpan"])();
            if (!activeSpan) {
                return;
            }
            const rootSpan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRootSpan"])(activeSpan);
            if (__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].document.hidden && rootSpan) {
                const cancelledStatus = 'cancelled';
                const { op, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(rootSpan);
                if (__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"]) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`[Tracing] Transaction: ${cancelledStatus} -> since tab moved to the background, op: ${op}`);
                }
                // We should not set status if it is already set, this prevent important statuses like
                // error or data loss from being overwritten on transaction.
                if (!status) {
                    rootSpan.setStatus({
                        code: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$spanstatus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPAN_STATUS_ERROR"],
                        message: cancelledStatus
                    });
                }
                rootSpan.setAttribute('sentry.cancellation_reason', 'document.hidden');
                rootSpan.end();
            }
        });
    } else {
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('[Tracing] Could not set up background tab detection due to lack of global document');
    }
}
;
 //# sourceMappingURL=backgroundtab.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/linkedTraces.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PREVIOUS_TRACE_KEY",
    ()=>PREVIOUS_TRACE_KEY,
    "PREVIOUS_TRACE_MAX_DURATION",
    ()=>PREVIOUS_TRACE_MAX_DURATION,
    "PREVIOUS_TRACE_TMP_SPAN_ATTRIBUTE",
    ()=>PREVIOUS_TRACE_TMP_SPAN_ATTRIBUTE,
    "addPreviousTraceSpanLink",
    ()=>addPreviousTraceSpanLink,
    "getPreviousTraceFromSessionStorage",
    ()=>getPreviousTraceFromSessionStorage,
    "linkTraces",
    ()=>linkTraces,
    "spanContextSampled",
    ()=>spanContextSampled,
    "storePreviousTraceInSessionStorage",
    ()=>storePreviousTraceInSessionStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/spanUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/semanticAttributes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/helpers.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
// 1h in seconds
const PREVIOUS_TRACE_MAX_DURATION = 3600;
// session storage key
const PREVIOUS_TRACE_KEY = 'sentry_previous_trace';
const PREVIOUS_TRACE_TMP_SPAN_ATTRIBUTE = 'sentry.previous_trace';
/**
 * Takes care of linking traces and applying the (consistent) sampling behavoiour based on the passed options
 * @param options - options for linking traces and consistent trace sampling (@see BrowserTracingOptions)
 * @param client - Sentry client
 */ function linkTraces(client, { linkPreviousTrace, consistentTraceSampling }) {
    const useSessionStorage = linkPreviousTrace === 'session-storage';
    let inMemoryPreviousTraceInfo = useSessionStorage ? getPreviousTraceFromSessionStorage() : undefined;
    client.on('spanStart', (span)=>{
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRootSpan"])(span) !== span) {
            return;
        }
        const oldPropagationContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])().getPropagationContext();
        inMemoryPreviousTraceInfo = addPreviousTraceSpanLink(inMemoryPreviousTraceInfo, span, oldPropagationContext);
        if (useSessionStorage) {
            storePreviousTraceInSessionStorage(inMemoryPreviousTraceInfo);
        }
    });
    let isFirstTraceOnPageload = true;
    if (consistentTraceSampling) {
        /*
    When users opt into `consistentTraceSampling`, we need to ensure that we propagate
    the previous trace's sample rate and rand to the current trace. This is necessary because otherwise, span
    metric extrapolation is inaccurate, as we'd propagate too high of a sample rate for the subsequent traces.

    So therefore, we pretend that the previous trace was the parent trace of the newly started trace. To do that,
    we mutate the propagation context of the current trace and set the sample rate and sample rand of the previous trace.
    Timing-wise, it is fine because it happens before we even sample the root span.

    @see https://github.com/getsentry/sentry-javascript/issues/15754
    */ client.on('beforeSampling', (mutableSamplingContextData)=>{
            if (!inMemoryPreviousTraceInfo) {
                return;
            }
            const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
            const currentPropagationContext = scope.getPropagationContext();
            // We do not want to force-continue the sampling decision if we continue a trace
            // that was started on the backend. Most prominently, this will happen in MPAs where
            // users hard-navigate between pages. In this case, the sampling decision of a potentially
            // started trace on the server takes precedence.
            // Why? We want to prioritize inter-trace consistency over intra-trace consistency.
            if (isFirstTraceOnPageload && currentPropagationContext.parentSpanId) {
                isFirstTraceOnPageload = false;
                return;
            }
            scope.setPropagationContext({
                ...currentPropagationContext,
                dsc: {
                    ...currentPropagationContext.dsc,
                    sample_rate: String(inMemoryPreviousTraceInfo.sampleRate),
                    sampled: String(spanContextSampled(inMemoryPreviousTraceInfo.spanContext))
                },
                sampleRand: inMemoryPreviousTraceInfo.sampleRand
            });
            mutableSamplingContextData.parentSampled = spanContextSampled(inMemoryPreviousTraceInfo.spanContext);
            mutableSamplingContextData.parentSampleRate = inMemoryPreviousTraceInfo.sampleRate;
            mutableSamplingContextData.spanAttributes = {
                ...mutableSamplingContextData.spanAttributes,
                [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE"]]: inMemoryPreviousTraceInfo.sampleRate
            };
        });
    }
}
/**
 * Adds a previous_trace span link to the passed span if the passed
 * previousTraceInfo is still valid.
 *
 * @returns the updated previous trace info (based on the current span/trace) to
 * be used on the next call
 */ function addPreviousTraceSpanLink(previousTraceInfo, span, oldPropagationContext) {
    const spanJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(span);
    function getSampleRate() {
        try {
            return Number(oldPropagationContext.dsc?.sample_rate) ?? Number(spanJson.data?.[__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE"]]);
        } catch  {
            return 0;
        }
    }
    const updatedPreviousTraceInfo = {
        spanContext: span.spanContext(),
        startTimestamp: spanJson.start_timestamp,
        sampleRate: getSampleRate(),
        sampleRand: oldPropagationContext.sampleRand
    };
    if (!previousTraceInfo) {
        return updatedPreviousTraceInfo;
    }
    const previousTraceSpanCtx = previousTraceInfo.spanContext;
    if (previousTraceSpanCtx.traceId === spanJson.trace_id) {
        // This means, we're still in the same trace so let's not update the previous trace info
        // or add a link to the current span.
        // Once we move away from the long-lived, route-based trace model, we can remove this cases
        return previousTraceInfo;
    }
    // Only add the link if the startTimeStamp of the previous trace's root span is within
    // PREVIOUS_TRACE_MAX_DURATION (1h) of the current root span's startTimestamp
    // This is done to
    // - avoid adding links to "stale" traces
    // - enable more efficient querying for previous/next traces in Sentry
    if (Date.now() / 1000 - previousTraceInfo.startTimestamp <= PREVIOUS_TRACE_MAX_DURATION) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"]) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`Adding previous_trace ${previousTraceSpanCtx} link to span ${{
                op: spanJson.op,
                ...span.spanContext()
            }}`);
        }
        span.addLink({
            context: previousTraceSpanCtx,
            attributes: {
                [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE"]]: 'previous_trace'
            }
        });
        // TODO: Remove this once EAP can store span links. We currently only set this attribute so that we
        // can obtain the previous trace information from the EAP store. Long-term, EAP will handle
        // span links and then we should remove this again. Also throwing in a TODO(v10), to remind us
        // to check this at v10 time :)
        span.setAttribute(PREVIOUS_TRACE_TMP_SPAN_ATTRIBUTE, `${previousTraceSpanCtx.traceId}-${previousTraceSpanCtx.spanId}-${spanContextSampled(previousTraceSpanCtx) ? 1 : 0}`);
    }
    return updatedPreviousTraceInfo;
}
/**
 * Stores @param previousTraceInfo in sessionStorage.
 */ function storePreviousTraceInSessionStorage(previousTraceInfo) {
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].sessionStorage.setItem(PREVIOUS_TRACE_KEY, JSON.stringify(previousTraceInfo));
    } catch (e) {
        // Ignore potential errors (e.g. if sessionStorage is not available)
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('Could not store previous trace in sessionStorage', e);
    }
}
/**
 * Retrieves the previous trace from sessionStorage if available.
 */ function getPreviousTraceFromSessionStorage() {
    try {
        const previousTraceInfo = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].sessionStorage?.getItem(PREVIOUS_TRACE_KEY);
        // @ts-expect-error - intentionally risking JSON.parse throwing when previousTraceInfo is null to save bundle size
        return JSON.parse(previousTraceInfo);
    } catch  {
        return undefined;
    }
}
/**
 * see {@link import('@sentry/core').spanIsSampled}
 */ function spanContextSampled(ctx) {
    return ctx.traceFlags === 0x1;
}
;
 //# sourceMappingURL=linkedTraces.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/resource-timing.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resourceTimingToSpanAttributes",
    ()=>resourceTimingToSpanAttributes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry-internal/browser-utils/build/esm/metrics/utils.js [app-client] (ecmascript)");
;
;
function getAbsoluteTime(time = 0) {
    return (((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserPerformanceTimeOrigin"])() || performance.timeOrigin) + time) / 1000;
}
/**
 * Converts a PerformanceResourceTiming entry to span data for the resource span.
 *
 * @param resourceTiming
 * @returns An array where the first element is the attribute name and the second element is the attribute value.
 */ function resourceTimingToSpanAttributes(resourceTiming) {
    const timingSpanData = [];
    // Checking for only `undefined` and `null` is intentional because it's
    // valid for `nextHopProtocol` to be an empty string.
    if (resourceTiming.nextHopProtocol != undefined) {
        const { name, version } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractNetworkProtocol"])(resourceTiming.nextHopProtocol);
        timingSpanData.push([
            'network.protocol.version',
            version
        ], [
            'network.protocol.name',
            name
        ]);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserPerformanceTimeOrigin"])()) {
        return timingSpanData;
    }
    return [
        ...timingSpanData,
        [
            'http.request.redirect_start',
            getAbsoluteTime(resourceTiming.redirectStart)
        ],
        [
            'http.request.fetch_start',
            getAbsoluteTime(resourceTiming.fetchStart)
        ],
        [
            'http.request.domain_lookup_start',
            getAbsoluteTime(resourceTiming.domainLookupStart)
        ],
        [
            'http.request.domain_lookup_end',
            getAbsoluteTime(resourceTiming.domainLookupEnd)
        ],
        [
            'http.request.connect_start',
            getAbsoluteTime(resourceTiming.connectStart)
        ],
        [
            'http.request.secure_connection_start',
            getAbsoluteTime(resourceTiming.secureConnectionStart)
        ],
        [
            'http.request.connection_end',
            getAbsoluteTime(resourceTiming.connectEnd)
        ],
        [
            'http.request.request_start',
            getAbsoluteTime(resourceTiming.requestStart)
        ],
        [
            'http.request.response_start',
            getAbsoluteTime(resourceTiming.responseStart)
        ],
        [
            'http.request.response_end',
            getAbsoluteTime(resourceTiming.responseEnd)
        ]
    ];
}
;
 //# sourceMappingURL=resource-timing.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/request.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultRequestInstrumentationOptions",
    ()=>defaultRequestInstrumentationOptions,
    "instrumentOutgoingRequests",
    ()=>instrumentOutgoingRequests,
    "shouldAttachHeaders",
    ()=>shouldAttachHeaders,
    "xhrCallback",
    ()=>xhrCallback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$instrument$2f$fetch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/instrument/fetch.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$fetch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/fetch.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/browser.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/string.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/spanUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$hasSpansEnabled$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$spanstatus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/spanstatus.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$trace$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/trace.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/semanticAttributes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$sentryNonRecordingSpan$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/sentryNonRecordingSpan.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$traceData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/traceData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$instrument$2f$xhr$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry-internal/browser-utils/build/esm/instrument/xhr.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$instrument$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry-internal/browser-utils/build/esm/metrics/instrument.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/helpers.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$resource$2d$timing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/resource-timing.js [app-client] (ecmascript)");
;
;
;
;
/** Options for Request Instrumentation */ const responseToSpanId = new WeakMap();
const spanIdToEndTimestamp = new Map();
const defaultRequestInstrumentationOptions = {
    traceFetch: true,
    traceXHR: true,
    enableHTTPTimings: true,
    trackFetchStreamPerformance: false
};
/** Registers span creators for xhr and fetch requests  */ function instrumentOutgoingRequests(client, _options) {
    const { traceFetch, traceXHR, trackFetchStreamPerformance, shouldCreateSpanForRequest, enableHTTPTimings, tracePropagationTargets, onRequestSpanStart } = {
        ...defaultRequestInstrumentationOptions,
        ..._options
    };
    const shouldCreateSpan = typeof shouldCreateSpanForRequest === 'function' ? shouldCreateSpanForRequest : (_)=>true;
    const shouldAttachHeadersWithTargets = (url)=>shouldAttachHeaders(url, tracePropagationTargets);
    const spans = {};
    if (traceFetch) {
        // Keeping track of http requests, whose body payloads resolved later than the initial resolved request
        // e.g. streaming using server sent events (SSE)
        client.addEventProcessor((event)=>{
            if (event.type === 'transaction' && event.spans) {
                event.spans.forEach((span)=>{
                    if (span.op === 'http.client') {
                        const updatedTimestamp = spanIdToEndTimestamp.get(span.span_id);
                        if (updatedTimestamp) {
                            span.timestamp = updatedTimestamp / 1000;
                            spanIdToEndTimestamp.delete(span.span_id);
                        }
                    }
                });
            }
            return event;
        });
        if (trackFetchStreamPerformance) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$instrument$2f$fetch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addFetchEndInstrumentationHandler"])((handlerData)=>{
                if (handlerData.response) {
                    const span = responseToSpanId.get(handlerData.response);
                    if (span && handlerData.endTimestamp) {
                        spanIdToEndTimestamp.set(span, handlerData.endTimestamp);
                    }
                }
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$instrument$2f$fetch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addFetchInstrumentationHandler"])((handlerData)=>{
            const createdSpan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$fetch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instrumentFetchRequest"])(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
            if (handlerData.response && handlerData.fetchData.__span) {
                responseToSpanId.set(handlerData.response, handlerData.fetchData.__span);
            }
            // We cannot use `window.location` in the generic fetch instrumentation,
            // but we need it for reliable `server.address` attribute.
            // so we extend this in here
            if (createdSpan) {
                const fullUrl = getFullURL(handlerData.fetchData.url);
                const host = fullUrl ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseUrl"])(fullUrl).host : undefined;
                createdSpan.setAttributes({
                    'http.url': fullUrl,
                    'server.address': host
                });
                if (enableHTTPTimings) {
                    addHTTPTimings(createdSpan);
                }
                onRequestSpanStart?.(createdSpan, {
                    headers: handlerData.headers
                });
            }
        });
    }
    if (traceXHR) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$instrument$2f$xhr$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addXhrInstrumentationHandler"])((handlerData)=>{
            const createdSpan = xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
            if (createdSpan) {
                if (enableHTTPTimings) {
                    addHTTPTimings(createdSpan);
                }
                let headers;
                try {
                    headers = new Headers(handlerData.xhr.__sentry_xhr_v3__?.request_headers);
                } catch  {
                // noop
                }
                onRequestSpanStart?.(createdSpan, {
                    headers
                });
            }
        });
    }
}
function isPerformanceResourceTiming(entry) {
    return entry.entryType === 'resource' && 'initiatorType' in entry && typeof entry.nextHopProtocol === 'string' && (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest');
}
/**
 * Creates a temporary observer to listen to the next fetch/xhr resourcing timings,
 * so that when timings hit their per-browser limit they don't need to be removed.
 *
 * @param span A span that has yet to be finished, must contain `url` on data.
 */ function addHTTPTimings(span) {
    const { url } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(span).data;
    if (!url || typeof url !== 'string') {
        return;
    }
    const cleanup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$instrument$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addPerformanceInstrumentationHandler"])('resource', ({ entries })=>{
        entries.forEach((entry)=>{
            if (isPerformanceResourceTiming(entry) && entry.name.endsWith(url)) {
                const spanAttributes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$resource$2d$timing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resourceTimingToSpanAttributes"])(entry);
                spanAttributes.forEach((attributeArray)=>span.setAttribute(...attributeArray));
                // In the next tick, clean this handler up
                // We have to wait here because otherwise this cleans itself up before it is fully done
                setTimeout(cleanup);
            }
        });
    });
}
/**
 * A function that determines whether to attach tracing headers to a request.
 * We only export this function for testing purposes.
 */ function shouldAttachHeaders(targetUrl, tracePropagationTargets) {
    // window.location.href not being defined is an edge case in the browser but we need to handle it.
    // Potentially dangerous situations where it may not be defined: Browser Extensions, Web Workers, patching of the location obj
    const href = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocationHref"])();
    if (!href) {
        // If there is no window.location.origin, we default to only attaching tracing headers to relative requests, i.e. ones that start with `/`
        // BIG DISCLAIMER: Users can call URLs with a double slash (fetch("//example.com/api")), this is a shorthand for "send to the same protocol",
        // so we need a to exclude those requests, because they might be cross origin.
        const isRelativeSameOriginRequest = !!targetUrl.match(/^\/(?!\/)/);
        if (!tracePropagationTargets) {
            return isRelativeSameOriginRequest;
        } else {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stringMatchesSomePattern"])(targetUrl, tracePropagationTargets);
        }
    } else {
        let resolvedUrl;
        let currentOrigin;
        // URL parsing may fail, we default to not attaching trace headers in that case.
        try {
            resolvedUrl = new URL(targetUrl, href);
            currentOrigin = new URL(href).origin;
        } catch  {
            return false;
        }
        const isSameOriginRequest = resolvedUrl.origin === currentOrigin;
        if (!tracePropagationTargets) {
            return isSameOriginRequest;
        } else {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stringMatchesSomePattern"])(resolvedUrl.toString(), tracePropagationTargets) || isSameOriginRequest && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stringMatchesSomePattern"])(resolvedUrl.pathname, tracePropagationTargets);
        }
    }
}
/**
 * Create and track xhr request spans
 *
 * @returns Span if a span was created, otherwise void.
 */ function xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeaders, spans) {
    const xhr = handlerData.xhr;
    const sentryXhrData = xhr?.[__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$instrument$2f$xhr$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SENTRY_XHR_DATA_KEY"]];
    if (!xhr || xhr.__sentry_own_request__ || !sentryXhrData) {
        return undefined;
    }
    const { url, method } = sentryXhrData;
    const shouldCreateSpanResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$hasSpansEnabled$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasSpansEnabled"])() && shouldCreateSpan(url);
    // check first if the request has finished and is tracked by an existing span which should now end
    if (handlerData.endTimestamp && shouldCreateSpanResult) {
        const spanId = xhr.__sentry_xhr_span_id__;
        if (!spanId) return;
        const span = spans[spanId];
        if (span && sentryXhrData.status_code !== undefined) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$spanstatus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setHttpStatus"])(span, sentryXhrData.status_code);
            span.end();
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete spans[spanId];
        }
        return undefined;
    }
    const fullUrl = getFullURL(url);
    const parsedUrl = fullUrl ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseUrl"])(fullUrl) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseUrl"])(url);
    const urlForSpanName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripUrlQueryAndFragment"])(url);
    const hasParent = !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActiveSpan"])();
    const span = shouldCreateSpanResult && hasParent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$trace$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startInactiveSpan"])({
        name: `${method} ${urlForSpanName}`,
        attributes: {
            url,
            type: 'xhr',
            'http.method': method,
            'http.url': fullUrl,
            'server.address': parsedUrl?.host,
            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]]: 'auto.http.browser',
            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_OP"]]: 'http.client',
            ...parsedUrl?.search && {
                'http.query': parsedUrl?.search
            },
            ...parsedUrl?.hash && {
                'http.fragment': parsedUrl?.hash
            }
        }
    }) : new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$sentryNonRecordingSpan$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SentryNonRecordingSpan"]();
    xhr.__sentry_xhr_span_id__ = span.spanContext().spanId;
    spans[xhr.__sentry_xhr_span_id__] = span;
    if (shouldAttachHeaders(url)) {
        addTracingHeadersToXhrRequest(xhr, // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
        // we do not want to use the span as base for the trace headers,
        // which means that the headers will be generated from the scope and the sampling decision is deferred
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$hasSpansEnabled$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasSpansEnabled"])() && hasParent ? span : undefined);
    }
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
    if (client) {
        client.emit('beforeOutgoingRequestSpan', span, handlerData);
    }
    return span;
}
function addTracingHeadersToXhrRequest(xhr, span) {
    const { 'sentry-trace': sentryTrace, baggage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$traceData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTraceData"])({
        span
    });
    if (sentryTrace) {
        setHeaderOnXhr(xhr, sentryTrace, baggage);
    }
}
function setHeaderOnXhr(xhr, sentryTraceHeader, sentryBaggageHeader) {
    const originalHeaders = xhr.__sentry_xhr_v3__?.request_headers;
    if (originalHeaders?.['sentry-trace']) {
        // bail if a sentry-trace header is already set
        return;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        xhr.setRequestHeader('sentry-trace', sentryTraceHeader);
        if (sentryBaggageHeader) {
            // only add our headers if
            // - no pre-existing baggage header exists
            // - or it is set and doesn't yet contain sentry values
            const originalBaggageHeader = originalHeaders?.['baggage'];
            if (!originalBaggageHeader || !baggageHeaderHasSentryValues(originalBaggageHeader)) {
                // From MDN: "If this method is called several times with the same header, the values are merged into one single request header."
                // We can therefore simply set a baggage header without checking what was there before
                // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                xhr.setRequestHeader('baggage', sentryBaggageHeader);
            }
        }
    } catch  {
    // Error: InvalidStateError: Failed to execute 'setRequestHeader' on 'XMLHttpRequest': The object's state must be OPENED.
    }
}
function baggageHeaderHasSentryValues(baggageHeader) {
    return baggageHeader.split(',').some((value)=>value.trim().startsWith('sentry-'));
}
function getFullURL(url) {
    try {
        // By adding a base URL to new URL(), this will also work for relative urls
        // If `url` is a full URL, the base URL is ignored anyhow
        const parsed = new URL(url, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.origin);
        return parsed.href;
    } catch  {
        return undefined;
    }
}
;
 //# sourceMappingURL=request.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/browserTracingIntegration.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BROWSER_TRACING_INTEGRATION_ID",
    ()=>BROWSER_TRACING_INTEGRATION_ID,
    "browserTracingIntegration",
    ()=>browserTracingIntegration,
    "getMetaContent",
    ()=>getMetaContent,
    "startBrowserTracingNavigationSpan",
    ()=>startBrowserTracingNavigationSpan,
    "startBrowserTracingPageLoadSpan",
    ()=>startBrowserTracingPageLoadSpan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$idleSpan$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/idleSpan.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/browser.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/propagationContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$tracing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/tracing.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/spanUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/semanticAttributes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$trace$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/trace.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$dynamicSamplingContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$instrument$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry-internal/browser-utils/build/esm/instrument/history.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$inp$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry-internal/browser-utils/build/esm/metrics/inp.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$browserMetrics$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry-internal/browser-utils/build/esm/metrics/browserMetrics.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$elementTiming$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry-internal/browser-utils/build/esm/metrics/elementTiming.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/helpers.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$backgroundtab$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/backgroundtab.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$linkedTraces$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/linkedTraces.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$request$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/request.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
const BROWSER_TRACING_INTEGRATION_ID = 'BrowserTracing';
const DEFAULT_BROWSER_TRACING_OPTIONS = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$idleSpan$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TRACING_DEFAULTS"],
    instrumentNavigation: true,
    instrumentPageLoad: true,
    markBackgroundSpan: true,
    enableLongTask: true,
    enableLongAnimationFrame: true,
    enableInp: true,
    enableElementTiming: true,
    ignoreResourceSpans: [],
    ignorePerformanceApiSpans: [],
    detectRedirects: true,
    linkPreviousTrace: 'in-memory',
    consistentTraceSampling: false,
    _experiments: {},
    ...__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$request$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultRequestInstrumentationOptions"]
};
/**
 * The Browser Tracing integration automatically instruments browser pageload/navigation
 * actions as transactions, and captures requests, metrics and errors as spans.
 *
 * The integration can be configured with a variety of options, and can be extended to use
 * any routing library.
 *
 * We explicitly export the proper type here, as this has to be extended in some cases.
 */ const browserTracingIntegration = (_options = {})=>{
    const latestRoute = {
        name: undefined,
        source: undefined
    };
    /**
   * This is just a small wrapper that makes `document` optional.
   * We want to be extra-safe and always check that this exists, to ensure weird environments do not blow up.
   */ const optionalWindowDocument = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].document;
    const { enableInp, enableElementTiming, enableLongTask, enableLongAnimationFrame, _experiments: { enableInteractions, enableStandaloneClsSpans, enableStandaloneLcpSpans }, beforeStartSpan, idleTimeout, finalTimeout, childSpanTimeout, markBackgroundSpan, traceFetch, traceXHR, trackFetchStreamPerformance, shouldCreateSpanForRequest, enableHTTPTimings, ignoreResourceSpans, ignorePerformanceApiSpans, instrumentPageLoad, instrumentNavigation, detectRedirects, linkPreviousTrace, consistentTraceSampling, onRequestSpanStart } = {
        ...DEFAULT_BROWSER_TRACING_OPTIONS,
        ..._options
    };
    let _collectWebVitals;
    let lastInteractionTimestamp;
    /** Create routing idle transaction. */ function _createRouteSpan(client, startSpanOptions, makeActive = true) {
        const isPageloadTransaction = startSpanOptions.op === 'pageload';
        const finalStartSpanOptions = beforeStartSpan ? beforeStartSpan(startSpanOptions) : startSpanOptions;
        const attributes = finalStartSpanOptions.attributes || {};
        // If `finalStartSpanOptions.name` is different than `startSpanOptions.name`
        // it is because `beforeStartSpan` set a custom name. Therefore we set the source to 'custom'.
        if (startSpanOptions.name !== finalStartSpanOptions.name) {
            attributes[__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]] = 'custom';
            finalStartSpanOptions.attributes = attributes;
        }
        if (!makeActive) {
            // We want to ensure this has 0s duration
            const now = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dateTimestampInSeconds"])();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$trace$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startInactiveSpan"])({
                ...finalStartSpanOptions,
                startTime: now
            }).end(now);
            return;
        }
        latestRoute.name = finalStartSpanOptions.name;
        latestRoute.source = attributes[__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]];
        const idleSpan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$idleSpan$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startIdleSpan"])(finalStartSpanOptions, {
            idleTimeout,
            finalTimeout,
            childSpanTimeout,
            // should wait for finish signal if it's a pageload transaction
            disableAutoFinish: isPageloadTransaction,
            beforeSpanEnd: (span)=>{
                // This will generally always be defined here, because it is set in `setup()` of the integration
                // but technically, it is optional, so we guard here to be extra safe
                _collectWebVitals?.();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$browserMetrics$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addPerformanceEntries"])(span, {
                    recordClsOnPageloadSpan: !enableStandaloneClsSpans,
                    recordLcpOnPageloadSpan: !enableStandaloneLcpSpans,
                    ignoreResourceSpans,
                    ignorePerformanceApiSpans
                });
                setActiveIdleSpan(client, undefined);
                // A trace should stay consistent over the entire timespan of one route - even after the pageload/navigation ended.
                // Only when another navigation happens, we want to create a new trace.
                // This way, e.g. errors that occur after the pageload span ended are still associated to the pageload trace.
                const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
                const oldPropagationContext = scope.getPropagationContext();
                scope.setPropagationContext({
                    ...oldPropagationContext,
                    traceId: idleSpan.spanContext().traceId,
                    sampled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanIsSampled"])(idleSpan),
                    dsc: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$dynamicSamplingContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDynamicSamplingContextFromSpan"])(span)
                });
            }
        });
        setActiveIdleSpan(client, idleSpan);
        function emitFinish() {
            if (optionalWindowDocument && [
                'interactive',
                'complete'
            ].includes(optionalWindowDocument.readyState)) {
                client.emit('idleSpanEnableAutoFinish', idleSpan);
            }
        }
        if (isPageloadTransaction && optionalWindowDocument) {
            optionalWindowDocument.addEventListener('readystatechange', ()=>{
                emitFinish();
            });
            emitFinish();
        }
    }
    return {
        name: BROWSER_TRACING_INTEGRATION_ID,
        setup (client) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["registerSpanErrorInstrumentation"])();
            _collectWebVitals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$browserMetrics$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTrackingWebVitals"])({
                recordClsStandaloneSpans: enableStandaloneClsSpans || false,
                recordLcpStandaloneSpans: enableStandaloneLcpSpans || false,
                client
            });
            if (enableInp) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$inp$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTrackingINP"])();
            }
            if (enableElementTiming) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$elementTiming$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTrackingElementTiming"])();
            }
            if (enableLongAnimationFrame && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"].PerformanceObserver && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$browserMetrics$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTrackingLongAnimationFrames"])();
            } else if (enableLongTask) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$browserMetrics$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTrackingLongTasks"])();
            }
            if (enableInteractions) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$browserMetrics$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTrackingInteractions"])();
            }
            if (detectRedirects && optionalWindowDocument) {
                const interactionHandler = ()=>{
                    lastInteractionTimestamp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timestampInSeconds"])();
                };
                addEventListener('click', interactionHandler, {
                    capture: true
                });
                addEventListener('keydown', interactionHandler, {
                    capture: true,
                    passive: true
                });
            }
            function maybeEndActiveSpan() {
                const activeSpan = getActiveIdleSpan(client);
                if (activeSpan && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(activeSpan).timestamp) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`[Tracing] Finishing current active span with op: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(activeSpan).op}`);
                    // If there's an open active span, we need to finish it before creating an new one.
                    activeSpan.setAttribute(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON"], 'cancelled');
                    activeSpan.end();
                }
            }
            client.on('startNavigationSpan', (startSpanOptions, navigationOptions)=>{
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])() !== client) {
                    return;
                }
                if (navigationOptions?.isRedirect) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('[Tracing] Detected redirect, navigation span will not be the root span, but a child span.');
                    _createRouteSpan(client, {
                        op: 'navigation.redirect',
                        ...startSpanOptions
                    }, false);
                    return;
                }
                maybeEndActiveSpan();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().setPropagationContext({
                    traceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceId"])(),
                    sampleRand: Math.random()
                });
                const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
                scope.setPropagationContext({
                    traceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceId"])(),
                    sampleRand: Math.random()
                });
                // We reset this to ensure we do not have lingering incorrect data here
                // places that call this hook may set this where appropriate - else, the URL at span sending time is used
                scope.setSDKProcessingMetadata({
                    normalizedRequest: undefined
                });
                _createRouteSpan(client, {
                    op: 'navigation',
                    ...startSpanOptions
                });
            });
            client.on('startPageLoadSpan', (startSpanOptions, traceOptions = {})=>{
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])() !== client) {
                    return;
                }
                maybeEndActiveSpan();
                const sentryTrace = traceOptions.sentryTrace || getMetaContent('sentry-trace');
                const baggage = traceOptions.baggage || getMetaContent('baggage');
                const propagationContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$tracing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["propagationContextFromHeaders"])(sentryTrace, baggage);
                const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
                scope.setPropagationContext(propagationContext);
                // We store the normalized request data on the scope, so we get the request data at time of span creation
                // otherwise, the URL etc. may already be of the following navigation, and we'd report the wrong URL
                scope.setSDKProcessingMetadata({
                    normalizedRequest: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHttpRequestData"])()
                });
                _createRouteSpan(client, {
                    op: 'pageload',
                    ...startSpanOptions
                });
            });
        },
        afterAllSetup (client) {
            let startingUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocationHref"])();
            if (linkPreviousTrace !== 'off') {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$linkedTraces$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["linkTraces"])(client, {
                    linkPreviousTrace,
                    consistentTraceSampling
                });
            }
            if (__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location) {
                if (instrumentPageLoad) {
                    const origin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserPerformanceTimeOrigin"])();
                    startBrowserTracingPageLoadSpan(client, {
                        name: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.pathname,
                        // pageload should always start at timeOrigin (and needs to be in s, not ms)
                        startTime: origin ? origin / 1000 : undefined,
                        attributes: {
                            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: 'url',
                            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]]: 'auto.pageload.browser'
                        }
                    });
                }
                if (instrumentNavigation) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$instrument$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addHistoryInstrumentationHandler"])(({ to, from })=>{
                        /**
             * This early return is there to account for some cases where a navigation transaction starts right after
             * long-running pageload. We make sure that if `from` is undefined and a valid `startingURL` exists, we don't
             * create an uneccessary navigation transaction.
             *
             * This was hard to duplicate, but this behavior stopped as soon as this fix was applied. This issue might also
             * only be caused in certain development environments where the usage of a hot module reloader is causing
             * errors.
             */ if (from === undefined && startingUrl?.indexOf(to) !== -1) {
                            startingUrl = undefined;
                            return;
                        }
                        startingUrl = undefined;
                        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseStringToURLObject"])(to);
                        const activeSpan = getActiveIdleSpan(client);
                        const navigationIsRedirect = activeSpan && detectRedirects && isRedirect(activeSpan, lastInteractionTimestamp);
                        startBrowserTracingNavigationSpan(client, {
                            name: parsed?.pathname || __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.pathname,
                            attributes: {
                                [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: 'url',
                                [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]]: 'auto.navigation.browser'
                            }
                        }, {
                            url: to,
                            isRedirect: navigationIsRedirect
                        });
                    });
                }
            }
            if (markBackgroundSpan) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$backgroundtab$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["registerBackgroundTabDetection"])();
            }
            if (enableInteractions) {
                registerInteractionListener(client, idleTimeout, finalTimeout, childSpanTimeout, latestRoute);
            }
            if (enableInp) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2d$internal$2f$browser$2d$utils$2f$build$2f$esm$2f$metrics$2f$inp$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["registerInpInteractionListener"])();
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$request$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instrumentOutgoingRequests"])(client, {
                traceFetch,
                traceXHR,
                trackFetchStreamPerformance,
                tracePropagationTargets: client.getOptions().tracePropagationTargets,
                shouldCreateSpanForRequest,
                enableHTTPTimings,
                onRequestSpanStart
            });
        }
    };
};
/**
 * Manually start a page load span.
 * This will only do something if a browser tracing integration integration has been setup.
 *
 * If you provide a custom `traceOptions` object, it will be used to continue the trace
 * instead of the default behavior, which is to look it up on the <meta> tags.
 */ function startBrowserTracingPageLoadSpan(client, spanOptions, traceOptions) {
    client.emit('startPageLoadSpan', spanOptions, traceOptions);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])().setTransactionName(spanOptions.name);
    const pageloadSpan = getActiveIdleSpan(client);
    if (pageloadSpan) {
        client.emit('afterStartPageLoadSpan', pageloadSpan);
    }
    return pageloadSpan;
}
/**
 * Manually start a navigation span.
 * This will only do something if a browser tracing integration has been setup.
 */ function startBrowserTracingNavigationSpan(client, spanOptions, options) {
    const { url, isRedirect } = options || {};
    client.emit('beforeStartNavigationSpan', spanOptions, {
        isRedirect
    });
    client.emit('startNavigationSpan', spanOptions, {
        isRedirect
    });
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
    scope.setTransactionName(spanOptions.name);
    // We store the normalized request data on the scope, so we get the request data at time of span creation
    // otherwise, the URL etc. may already be of the following navigation, and we'd report the wrong URL
    if (url && !isRedirect) {
        scope.setSDKProcessingMetadata({
            normalizedRequest: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHttpRequestData"])(),
                url
            }
        });
    }
    return getActiveIdleSpan(client);
}
/** Returns the value of a meta tag */ function getMetaContent(metaName) {
    /**
   * This is just a small wrapper that makes `document` optional.
   * We want to be extra-safe and always check that this exists, to ensure weird environments do not blow up.
   */ const optionalWindowDocument = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].document;
    const metaTag = optionalWindowDocument?.querySelector(`meta[name=${metaName}]`);
    return metaTag?.getAttribute('content') || undefined;
}
/** Start listener for interaction transactions */ function registerInteractionListener(client, idleTimeout, finalTimeout, childSpanTimeout, latestRoute) {
    /**
   * This is just a small wrapper that makes `document` optional.
   * We want to be extra-safe and always check that this exists, to ensure weird environments do not blow up.
   */ const optionalWindowDocument = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].document;
    let inflightInteractionSpan;
    const registerInteractionTransaction = ()=>{
        const op = 'ui.action.click';
        const activeIdleSpan = getActiveIdleSpan(client);
        if (activeIdleSpan) {
            const currentRootSpanOp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(activeIdleSpan).op;
            if ([
                'navigation',
                'pageload'
            ].includes(currentRootSpanOp)) {
                __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn(`[Tracing] Did not create ${op} span because a pageload or navigation span is in progress.`);
                return undefined;
            }
        }
        if (inflightInteractionSpan) {
            inflightInteractionSpan.setAttribute(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON"], 'interactionInterrupted');
            inflightInteractionSpan.end();
            inflightInteractionSpan = undefined;
        }
        if (!latestRoute.name) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn(`[Tracing] Did not create ${op} transaction because _latestRouteName is missing.`);
            return undefined;
        }
        inflightInteractionSpan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$idleSpan$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startIdleSpan"])({
            name: latestRoute.name,
            op,
            attributes: {
                [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: latestRoute.source || 'url'
            }
        }, {
            idleTimeout,
            finalTimeout,
            childSpanTimeout
        });
    };
    if (optionalWindowDocument) {
        addEventListener('click', registerInteractionTransaction, {
            capture: true
        });
    }
}
// We store the active idle span on the client object, so we can access it from exported functions
const ACTIVE_IDLE_SPAN_PROPERTY = '_sentry_idleSpan';
function getActiveIdleSpan(client) {
    return client[ACTIVE_IDLE_SPAN_PROPERTY];
}
function setActiveIdleSpan(client, span) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(client, ACTIVE_IDLE_SPAN_PROPERTY, span);
}
// The max. time in seconds between two pageload/navigation spans that makes us consider the second one a redirect
const REDIRECT_THRESHOLD = 0.3;
function isRedirect(activeSpan, lastInteractionTimestamp) {
    const spanData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(activeSpan);
    const now = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dateTimestampInSeconds"])();
    // More than 300ms since last navigation/pageload span?
    // --> never consider this a redirect
    const startTimestamp = spanData.start_timestamp;
    if (now - startTimestamp > REDIRECT_THRESHOLD) {
        return false;
    }
    // A click happened in the last 300ms?
    // --> never consider this a redirect
    if (lastInteractionTimestamp && now - lastInteractionTimestamp <= REDIRECT_THRESHOLD) {
        return false;
    }
    return true;
}
;
 //# sourceMappingURL=browserTracingIntegration.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/nextjs/build/esm/common/debug-build.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */ __turbopack_context__.s([
    "DEBUG_BUILD",
    ()=>DEBUG_BUILD
]);
const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__;
;
 //# sourceMappingURL=debug-build.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/nextjs/build/esm/client/routing/parameterization.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "maybeParameterizeRoute",
    ()=>maybeParameterizeRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$common$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/nextjs/build/esm/common/debug-build.js [app-client] (ecmascript)");
;
;
const globalWithInjectedManifest = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
// Some performance caches
let cachedManifest = null;
let cachedManifestString = undefined;
const compiledRegexCache = new Map();
const routeResultCache = new Map();
/**
 * Calculate the specificity score for a route path.
 * Lower scores indicate more specific routes.
 */ function getRouteSpecificity(routePath) {
    const segments = routePath.split('/').filter(Boolean);
    let score = 0;
    for (const segment of segments){
        if (segment.startsWith(':')) {
            const paramName = segment.substring(1);
            if (paramName.endsWith('*?')) {
                // Optional catch-all: [[...param]]
                score += 1000;
            } else if (paramName.endsWith('*')) {
                // Required catch-all: [...param]
                score += 100;
            } else {
                // Regular dynamic segment: [param]
                score += 10;
            }
        }
    // Static segments add 0 to score as they are most specific
    }
    return score;
}
/**
 * Get compiled regex from cache or create and cache it.
 */ function getCompiledRegex(regexString) {
    if (compiledRegexCache.has(regexString)) {
        return compiledRegexCache.get(regexString) ?? null;
    }
    try {
        // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- regex patterns are from build-time route manifest, not user input
        const regex = new RegExp(regexString);
        compiledRegexCache.set(regexString, regex);
        return regex;
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$common$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('Could not compile regex', {
            regexString,
            error
        });
        // Cache the failure to avoid repeated attempts by storing undefined
        return null;
    }
}
/**
 * Get and cache the route manifest from the global object.
 * @returns The parsed route manifest or null if not available/invalid.
 */ function getManifest() {
    if (!globalWithInjectedManifest?._sentryRouteManifest || typeof globalWithInjectedManifest._sentryRouteManifest !== 'string') {
        return null;
    }
    const currentManifestString = globalWithInjectedManifest._sentryRouteManifest;
    // Return cached manifest if the string hasn't changed
    if (cachedManifest && cachedManifestString === currentManifestString) {
        return cachedManifest;
    }
    // Clear caches when manifest changes
    compiledRegexCache.clear();
    routeResultCache.clear();
    let manifest = {
        staticRoutes: [],
        dynamicRoutes: []
    };
    // Shallow check if the manifest is actually what we expect it to be
    try {
        manifest = JSON.parse(currentManifestString);
        if (!Array.isArray(manifest.staticRoutes) || !Array.isArray(manifest.dynamicRoutes)) {
            return null;
        }
        // Cache the successfully parsed manifest
        cachedManifest = manifest;
        cachedManifestString = currentManifestString;
        return manifest;
    } catch  {
        // Something went wrong while parsing the manifest, so we'll fallback to no parameterization
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$common$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('Could not extract route manifest');
        return null;
    }
}
/**
 * Find matching routes from static and dynamic route collections.
 * @param route - The route to match against.
 * @param staticRoutes - Array of static route objects.
 * @param dynamicRoutes - Array of dynamic route objects.
 * @returns Array of matching route paths.
 */ function findMatchingRoutes(route, staticRoutes, dynamicRoutes) {
    const matches = [];
    // Static path: no parameterization needed, return empty array
    if (staticRoutes.some((r)=>r.path === route)) {
        return matches;
    }
    // Dynamic path: find the route pattern that matches the concrete route
    for (const dynamicRoute of dynamicRoutes){
        if (dynamicRoute.regex) {
            const regex = getCompiledRegex(dynamicRoute.regex);
            if (regex?.test(route)) {
                matches.push(dynamicRoute.path);
            }
        }
    }
    return matches;
}
/**
 * Parameterize a route using the route manifest.
 *
 * @param route - The route to parameterize.
 * @returns The parameterized route or undefined if no parameterization is needed.
 */ const maybeParameterizeRoute = (route)=>{
    const manifest = getManifest();
    if (!manifest) {
        return undefined;
    }
    // Check route result cache after manifest validation
    if (routeResultCache.has(route)) {
        return routeResultCache.get(route);
    }
    const { staticRoutes, dynamicRoutes } = manifest;
    if (!Array.isArray(staticRoutes) || !Array.isArray(dynamicRoutes)) {
        return undefined;
    }
    const matches = findMatchingRoutes(route, staticRoutes, dynamicRoutes);
    // We can always do the `sort()` call, it will short-circuit when it has one array item
    const result = matches.sort((a, b)=>getRouteSpecificity(a) - getRouteSpecificity(b))[0];
    routeResultCache.set(route, result);
    return result;
};
;
 //# sourceMappingURL=parameterization.js.map
}),
"[project]/Documents/zama/merces-front2/node_modules/@sentry/nextjs/build/esm/client/routing/appRouterRoutingInstrumentation.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME",
    ()=>INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME,
    "appRouterInstrumentNavigation",
    ()=>appRouterInstrumentNavigation,
    "appRouterInstrumentPageLoad",
    ()=>appRouterInstrumentPageLoad,
    "captureRouterTransitionStart",
    ()=>captureRouterTransitionStart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/semanticAttributes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/helpers.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$browserTracingIntegration$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/browser/build/npm/esm/tracing/browserTracingIntegration.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$client$2f$routing$2f$parameterization$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@sentry/nextjs/build/esm/client/routing/parameterization.js [app-client] (ecmascript)");
;
;
;
const INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME = 'incomplete-app-router-transaction';
/**
 * This mutable keeps track of what router navigation instrumentation mechanism we are using.
 *
 * The default one is 'router-patch' which is a way of instrumenting that worked up until Next.js 15.3.0 was released.
 * For this method we took the global router instance and simply monkey patched all the router methods like push(), replace(), and so on.
 * This worked because Next.js itself called the router methods for things like the <Link /> component.
 * Vercel decided that it is not good to call these public API methods from within the framework so they switched to an internal system that completely bypasses our monkey patching. This happened in 15.3.0.
 *
 * We raised with Vercel that this breaks our SDK so together with them we came up with an API for `instrumentation-client.ts` called `onRouterTransitionStart` that is called whenever a navigation is kicked off.
 *
 * Now we have the problem of version compatibility.
 * For older Next.js versions we cannot use the new hook so we need to always patch the router.
 * For newer Next.js versions we cannot know whether the user actually registered our handler for the `onRouterTransitionStart` hook, so we need to wait until it was called at least once before switching the instrumentation mechanism.
 * The problem is, that the user may still have registered a hook and then call a patched router method.
 * First, the monkey patched router method will be called, starting a navigation span, then the hook will also called.
 * We need to handle this case and not create two separate navigation spans but instead update the current navigation span and then switch to the new instrumentation mode.
 * This is all denoted by this `navigationRoutingMode` variable.
 */ let navigationRoutingMode = 'router-patch';
const currentRouterPatchingNavigationSpanRef = {
    current: undefined
};
/** Instruments the Next.js app router for pageloads. */ function appRouterInstrumentPageLoad(client) {
    const parameterizedPathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$client$2f$routing$2f$parameterization$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maybeParameterizeRoute"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.pathname);
    const origin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserPerformanceTimeOrigin"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$browserTracingIntegration$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startBrowserTracingPageLoadSpan"])(client, {
        name: parameterizedPathname ?? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.pathname,
        // pageload should always start at timeOrigin (and needs to be in s, not ms)
        startTime: origin ? origin / 1000 : undefined,
        attributes: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_OP"]]: 'pageload',
            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]]: 'auto.pageload.nextjs.app_router_instrumentation',
            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: parameterizedPathname ? 'route' : 'url'
        }
    });
}
// Yes, yes, I know we shouldn't depend on these internals. But that's where we are at. We write the ugly code, so you don't have to.
const GLOBAL_OBJ_WITH_NEXT_ROUTER = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
/*
 * The routing instrumentation needs to handle a few cases:
 * - Router operations:
 *  - router.push() (either explicitly called or implicitly through <Link /> tags)
 *  - router.replace() (either explicitly called or implicitly through <Link replace /> tags)
 *  - router.back()
 *  - router.forward()
 * - Browser operations:
 *  - native Browser-back / popstate event (implicitly called by router.back())
 *  - native Browser-forward / popstate event (implicitly called by router.forward())
 */ /** Instruments the Next.js app router for navigation. */ function appRouterInstrumentNavigation(client) {
    routerTransitionHandler = (href, navigationType)=>{
        const unparameterizedPathname = new URL(href, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.href).pathname;
        const parameterizedPathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$client$2f$routing$2f$parameterization$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maybeParameterizeRoute"])(unparameterizedPathname);
        const pathname = parameterizedPathname ?? unparameterizedPathname;
        if (navigationRoutingMode === 'router-patch') {
            navigationRoutingMode = 'transition-start-hook';
        }
        const currentNavigationSpan = currentRouterPatchingNavigationSpanRef.current;
        if (currentNavigationSpan) {
            currentNavigationSpan.updateName(pathname);
            currentNavigationSpan.setAttributes({
                'navigation.type': `router.${navigationType}`,
                [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: parameterizedPathname ? 'route' : 'url'
            });
            currentRouterPatchingNavigationSpanRef.current = undefined;
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$browserTracingIntegration$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startBrowserTracingNavigationSpan"])(client, {
                name: pathname,
                attributes: {
                    [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_OP"]]: 'navigation',
                    [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]]: 'auto.navigation.nextjs.app_router_instrumentation',
                    [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: parameterizedPathname ? 'route' : 'url',
                    'navigation.type': `router.${navigationType}`
                }
            });
        }
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].addEventListener('popstate', ()=>{
        const parameterizedPathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$client$2f$routing$2f$parameterization$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maybeParameterizeRoute"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.pathname);
        if (currentRouterPatchingNavigationSpanRef.current?.isRecording()) {
            currentRouterPatchingNavigationSpanRef.current.updateName(parameterizedPathname ?? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.pathname);
            currentRouterPatchingNavigationSpanRef.current.setAttribute(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"], parameterizedPathname ? 'route' : 'url');
        } else {
            currentRouterPatchingNavigationSpanRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$browserTracingIntegration$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startBrowserTracingNavigationSpan"])(client, {
                name: parameterizedPathname ?? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$helpers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WINDOW"].location.pathname,
                attributes: {
                    [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]]: 'auto.navigation.nextjs.app_router_instrumentation',
                    [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: parameterizedPathname ? 'route' : 'url',
                    'navigation.type': 'browser.popstate'
                }
            });
        }
    });
    let routerPatched = false;
    let triesToFindRouter = 0;
    const MAX_TRIES_TO_FIND_ROUTER = 500;
    const ROUTER_AVAILABILITY_CHECK_INTERVAL_MS = 20;
    const checkForRouterAvailabilityInterval = setInterval(()=>{
        triesToFindRouter++;
        const router = GLOBAL_OBJ_WITH_NEXT_ROUTER?.next?.router ?? GLOBAL_OBJ_WITH_NEXT_ROUTER?.nd?.router;
        if (routerPatched || triesToFindRouter > MAX_TRIES_TO_FIND_ROUTER) {
            clearInterval(checkForRouterAvailabilityInterval);
        } else if (router) {
            clearInterval(checkForRouterAvailabilityInterval);
            routerPatched = true;
            patchRouter(client, router, currentRouterPatchingNavigationSpanRef);
            // If the router at any point gets overridden - patch again
            [
                'nd',
                'next'
            ].forEach((globalValueName)=>{
                const globalValue = GLOBAL_OBJ_WITH_NEXT_ROUTER[globalValueName];
                if (globalValue) {
                    GLOBAL_OBJ_WITH_NEXT_ROUTER[globalValueName] = new Proxy(globalValue, {
                        set (target, p, newValue) {
                            if (p === 'router' && typeof newValue === 'object' && newValue !== null) {
                                patchRouter(client, newValue, currentRouterPatchingNavigationSpanRef);
                            }
                            // @ts-expect-error we cannot possibly type this
                            target[p] = newValue;
                            return true;
                        }
                    });
                }
            });
        }
    }, ROUTER_AVAILABILITY_CHECK_INTERVAL_MS);
}
function transactionNameifyRouterArgument(target) {
    try {
        // We provide an arbitrary base because we only care about the pathname and it makes URL parsing more resilient.
        return new URL(target, 'http://example.com/').pathname;
    } catch  {
        return '/';
    }
}
const patchedRouters = new WeakSet();
function patchRouter(client, router, currentNavigationSpanRef) {
    if (patchedRouters.has(router)) {
        return;
    }
    patchedRouters.add(router);
    [
        'back',
        'forward',
        'push',
        'replace'
    ].forEach((routerFunctionName)=>{
        if (router?.[routerFunctionName]) {
            // @ts-expect-error Weird type error related to not knowing how to associate return values with the individual functions - we can just ignore
            router[routerFunctionName] = new Proxy(router[routerFunctionName], {
                apply (target, thisArg, argArray) {
                    if (navigationRoutingMode !== 'router-patch') {
                        return target.apply(thisArg, argArray);
                    }
                    let transactionName = INCOMPLETE_APP_ROUTER_INSTRUMENTATION_TRANSACTION_NAME;
                    const transactionAttributes = {
                        [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_OP"]]: 'navigation',
                        [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]]: 'auto.navigation.nextjs.app_router_instrumentation',
                        [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: 'url'
                    };
                    if (routerFunctionName === 'push') {
                        transactionName = transactionNameifyRouterArgument(argArray[0]);
                        transactionAttributes['navigation.type'] = 'router.push';
                    } else if (routerFunctionName === 'replace') {
                        transactionName = transactionNameifyRouterArgument(argArray[0]);
                        transactionAttributes['navigation.type'] = 'router.replace';
                    } else if (routerFunctionName === 'back') {
                        transactionAttributes['navigation.type'] = 'router.back';
                    } else if (routerFunctionName === 'forward') {
                        transactionAttributes['navigation.type'] = 'router.forward';
                    }
                    const parameterizedPathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$client$2f$routing$2f$parameterization$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maybeParameterizeRoute"])(transactionName);
                    currentNavigationSpanRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$tracing$2f$browserTracingIntegration$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startBrowserTracingNavigationSpan"])(client, {
                        name: parameterizedPathname ?? transactionName,
                        attributes: {
                            ...transactionAttributes,
                            [__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: parameterizedPathname ? 'route' : 'url'
                        }
                    });
                    return target.apply(thisArg, argArray);
                }
            });
        }
    });
}
let routerTransitionHandler = undefined;
/**
 * A handler for Next.js' `onRouterTransitionStart` hook in `instrumentation-client.ts` to record navigation spans in Sentry.
 */ function captureRouterTransitionStart(href, navigationType) {
    if (routerTransitionHandler) {
        routerTransitionHandler(href, navigationType);
    }
}
;
 //# sourceMappingURL=appRouterRoutingInstrumentation.js.map
}),
]);

//# sourceMappingURL=474fd_d41cfdcc._.js.map