(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/zama/merces-front2/src/components/themes/theme.config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
const DEFAULT_THEME = 'merces';
const THEMES = [
    {
        name: 'Merces (Cool)',
        value: 'merces'
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
"[project]/Documents/zama/merces-front2/src/components/themes/active-theme.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActiveThemeProvider",
    ()=>ActiveThemeProvider,
    "useThemeConfig",
    ()=>useThemeConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$themes$2f$theme$2e$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/components/themes/theme.config.ts [app-client] (ecmascript)");
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
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ActiveThemeProvider({ children, initialTheme }) {
    _s();
    const themeToUse = initialTheme || __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$themes$2f$theme$2e$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_THEME"];
    const [activeTheme, setActiveTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(themeToUse);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            activeTheme,
            setActiveTheme
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/themes/active-theme.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(ActiveThemeProvider, "TXVSXChZYArlDxbwFrzTWAXCvWE=");
_c = ActiveThemeProvider;
function useThemeConfig() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
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
"[project]/Documents/zama/merces-front2/src/components/layout/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$themes$2f$active$2d$theme$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/components/themes/active-theme.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function Providers({ activeThemeValue, children }) {
    _s();
    const { resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$themes$2f$active$2d$theme$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActiveThemeProvider"], {
            initialTheme: activeThemeValue,
            children: children
        }, void 0, false, {
            fileName: "[project]/Documents/zama/merces-front2/src/components/layout/providers.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_s(Providers, "ZFEt0jE4OUgXZiwzKU9YAbCBnGI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/zama/merces-front2/src/components/ui/sonner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const Toaster = ({ ...props })=>{
    _s();
    const { theme = 'system' } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
        theme: theme,
        className: "toaster group",
        style: {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)'
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/sonner.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Toaster, "bbCbBsvL7+LiaR8ofHlkcwveh/Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
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
"[project]/Documents/zama/merces-front2/src/components/themes/theme-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/themes/theme-provider.tsx",
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

//# sourceMappingURL=Documents_zama_merces-front2_src_components_7f1d903e._.js.map