(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/zama/PayMe/frontend/src/components/themes/theme.config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Default theme that loads when no user preference is set
 * Change this value to set a different default theme
 */ __turbopack_context__.s([
    "DEFAULT_THEME",
    ()=>DEFAULT_THEME,
    "THEMES",
    ()=>THEMES
]);
const DEFAULT_THEME = 'payme';
const THEMES = [
    {
        name: 'PayMe (Default)',
        value: 'payme'
    },
    {
        name: 'Claude',
        value: 'claude'
    },
    {
        name: 'Neobrutualism',
        value: 'neobrutualism'
    },
    {
        name: 'Supabase',
        value: 'supabase'
    },
    {
        name: 'Vercel',
        value: 'vercel'
    },
    {
        name: 'Mono',
        value: 'mono'
    },
    {
        name: 'Notebook',
        value: 'notebook'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/zama/PayMe/frontend/src/components/themes/active-theme.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActiveThemeProvider",
    ()=>ActiveThemeProvider,
    "useThemeConfig",
    ()=>useThemeConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$src$2f$components$2f$themes$2f$theme$2e$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/src/components/themes/theme.config.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const COOKIE_NAME = 'active_theme';
function setThemeCookie(theme) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
}
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ActiveThemeProvider({ children, initialTheme }) {
    _s();
    const themeToUse = initialTheme || __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$src$2f$components$2f$themes$2f$theme$2e$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_THEME"];
    const [activeTheme, setActiveTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(themeToUse);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ActiveThemeProvider.useEffect": ()=>{
            // Only update if theme has changed
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme !== activeTheme) {
                setThemeCookie(activeTheme);
                // Remove existing data-theme attribute
                document.documentElement.removeAttribute('data-theme');
                // Remove any theme classes from body (cleanup)
                Array.from(document.body.classList).filter({
                    "ActiveThemeProvider.useEffect": (className)=>className.startsWith('theme-')
                }["ActiveThemeProvider.useEffect"]).forEach({
                    "ActiveThemeProvider.useEffect": (className)=>{
                        document.body.classList.remove(className);
                    }
                }["ActiveThemeProvider.useEffect"]);
                // Set data-theme on html element
                if (activeTheme) {
                    document.documentElement.setAttribute('data-theme', activeTheme);
                }
            } else {
                // Still update cookie in case it's missing
                setThemeCookie(activeTheme);
            }
        }
    }["ActiveThemeProvider.useEffect"], [
        activeTheme
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            activeTheme,
            setActiveTheme
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Documents/zama/PayMe/frontend/src/components/themes/active-theme.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(ActiveThemeProvider, "TXVSXChZYArlDxbwFrzTWAXCvWE=");
_c = ActiveThemeProvider;
function useThemeConfig() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeConfig must be used within an ActiveThemeProvider');
    }
    return context;
}
_s1(useThemeConfig, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ActiveThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/zama/PayMe/frontend/src/lib/web3-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Web3Providers",
    ()=>Web3Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/@rainbow-me/rainbowkit/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$chunk$2d$RZWDCITT$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/@rainbow-me/rainbowkit/dist/chunk-RZWDCITT.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$chunk$2d$72HZGUJA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/@rainbow-me/rainbowkit/dist/chunk-72HZGUJA.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/wagmi/dist/esm/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$sepolia$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/viem/_esm/chains/definitions/sepolia.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDefaultConfig"])({
    appName: 'PayMe Private Card',
    projectId: 'YOUR_PROJECT_ID',
    chains: [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$sepolia$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sepolia"]
    ],
    ssr: true
});
const queryClient = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]();
function Web3Providers({ children }) {
    _s();
    const { resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WagmiProvider"], {
        config: config,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
            client: queryClient,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RainbowKitProvider"], {
                theme: resolvedTheme === 'dark' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$chunk$2d$RZWDCITT$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["darkTheme"])({
                    accentColor: 'oklch(0.7 0.15 200)',
                    accentColorForeground: 'black',
                    borderRadius: 'medium'
                }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$chunk$2d$72HZGUJA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lightTheme"])({
                    accentColor: 'oklch(0.55 0.18 250)',
                    accentColorForeground: 'white',
                    borderRadius: 'medium'
                }),
                children: children
            }, void 0, false, {
                fileName: "[project]/Documents/zama/PayMe/frontend/src/lib/web3-provider.tsx",
                lineNumber: 31,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/zama/PayMe/frontend/src/lib/web3-provider.tsx",
            lineNumber: 30,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/zama/PayMe/frontend/src/lib/web3-provider.tsx",
        lineNumber: 29,
        columnNumber: 9
    }, this);
}
_s(Web3Providers, "ZFEt0jE4OUgXZiwzKU9YAbCBnGI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Web3Providers;
var _c;
__turbopack_context__.k.register(_c, "Web3Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/zama/PayMe/frontend/src/components/layout/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$src$2f$components$2f$themes$2f$active$2d$theme$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/src/components/themes/active-theme.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$src$2f$lib$2f$web3$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/src/lib/web3-provider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function Providers({ activeThemeValue, children }) {
    _s();
    const { resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$src$2f$components$2f$themes$2f$active$2d$theme$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActiveThemeProvider"], {
            initialTheme: activeThemeValue,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$src$2f$lib$2f$web3$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Web3Providers"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/Documents/zama/PayMe/frontend/src/components/layout/providers.tsx",
                lineNumber: 19,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/zama/PayMe/frontend/src/components/layout/providers.tsx",
            lineNumber: 18,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_s(Providers, "ZFEt0jE4OUgXZiwzKU9YAbCBnGI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/zama/PayMe/frontend/src/components/ui/sonner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const Toaster = ({ ...props })=>{
    _s();
    const { theme = 'system' } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
        theme: theme,
        className: "toaster group",
        style: {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)'
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/PayMe/frontend/src/components/ui/sonner.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Toaster, "bbCbBsvL7+LiaR8ofHlkcwveh/Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Toaster;
;
var _c;
__turbopack_context__.k.register(_c, "Toaster");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/zama/PayMe/frontend/src/components/themes/theme-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/PayMe/frontend/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$PayMe$2f$frontend$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/Documents/zama/PayMe/frontend/src/components/themes/theme-provider.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Documents_zama_PayMe_frontend_src_fb215534._.js.map