module.exports = [
"[project]/Documents/zama/merces-front2/src/app/favicon.ico.mjs { IMAGE => \"[project]/Documents/zama/merces-front2/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/favicon.ico.mjs { IMAGE => \"[project]/Documents/zama/merces-front2/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Documents/zama/merces-front2/src/app/global-error.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/global-error.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/app/not-found.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/not-found.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/dashboard/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/dashboard/overview/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/error.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/dashboard/overview/error.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/error.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/error.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/loading.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/loading.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/zama/merces-front2/src/constants/mock-api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////
__turbopack_context__.s([
    "delay",
    ()=>delay,
    "fakeProducts",
    ()=>fakeProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$faker$2d$js$2f$faker$2f$dist$2f$chunk$2d$KZPPZA2C$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__a__as__faker$3e$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/@faker-js/faker/dist/chunk-KZPPZA2C.js [app-rsc] (ecmascript) <export a as faker>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$match$2d$sorter$2f$dist$2f$match$2d$sorter$2e$esm$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/match-sorter/dist/match-sorter.esm.js [app-rsc] (ecmascript)"); // For filtering
;
;
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
const fakeProducts = {
    records: [],
    // Initialize with sample data
    initialize () {
        const sampleProducts = [];
        function generateRandomProductData(id) {
            const categories = [
                'Electronics',
                'Furniture',
                'Clothing',
                'Toys',
                'Groceries',
                'Books',
                'Jewelry',
                'Beauty Products'
            ];
            return {
                id,
                name: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$faker$2d$js$2f$faker$2f$dist$2f$chunk$2d$KZPPZA2C$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__a__as__faker$3e$__["faker"].commerce.productName(),
                description: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$faker$2d$js$2f$faker$2f$dist$2f$chunk$2d$KZPPZA2C$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__a__as__faker$3e$__["faker"].commerce.productDescription(),
                created_at: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$faker$2d$js$2f$faker$2f$dist$2f$chunk$2d$KZPPZA2C$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__a__as__faker$3e$__["faker"].date.between({
                    from: '2022-01-01',
                    to: '2023-12-31'
                }).toISOString(),
                price: parseFloat(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$faker$2d$js$2f$faker$2f$dist$2f$chunk$2d$KZPPZA2C$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__a__as__faker$3e$__["faker"].commerce.price({
                    min: 5,
                    max: 500,
                    dec: 2
                })),
                photo_url: `https://api.slingacademy.com/public/sample-products/${id}.png`,
                category: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$faker$2d$js$2f$faker$2f$dist$2f$chunk$2d$KZPPZA2C$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__a__as__faker$3e$__["faker"].helpers.arrayElement(categories),
                updated_at: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f40$faker$2d$js$2f$faker$2f$dist$2f$chunk$2d$KZPPZA2C$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__a__as__faker$3e$__["faker"].date.recent().toISOString()
            };
        }
        // Generate remaining records
        for(let i = 1; i <= 20; i++){
            sampleProducts.push(generateRandomProductData(i));
        }
        this.records = sampleProducts;
    },
    // Get all products with optional category filtering and search
    async getAll ({ categories = [], search }) {
        let products = [
            ...this.records
        ];
        // Filter products based on selected categories
        if (categories.length > 0) {
            products = products.filter((product)=>categories.includes(product.category));
        }
        // Search functionality across multiple fields
        if (search) {
            products = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$match$2d$sorter$2f$dist$2f$match$2d$sorter$2e$esm$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["matchSorter"])(products, search, {
                keys: [
                    'name',
                    'description',
                    'category'
                ]
            });
        }
        return products;
    },
    // Get paginated results with optional category filtering and search
    async getProducts ({ page = 1, limit = 10, categories, search }) {
        await delay(1000);
        const categoriesArray = categories ? categories.split('.') : [];
        const allProducts = await this.getAll({
            categories: categoriesArray,
            search
        });
        const totalProducts = allProducts.length;
        // Pagination logic
        const offset = (page - 1) * limit;
        const paginatedProducts = allProducts.slice(offset, offset + limit);
        // Mock current time
        const currentTime = new Date().toISOString();
        // Return paginated response
        return {
            success: true,
            time: currentTime,
            message: 'Sample data for testing and learning purposes',
            total_products: totalProducts,
            offset,
            limit,
            products: paginatedProducts
        };
    },
    // Get a specific product by its ID
    async getProductById (id) {
        await delay(1000); // Simulate a delay
        // Find the product by its ID
        const product = this.records.find((product)=>product.id === id);
        if (!product) {
            return {
                success: false,
                message: `Product with ID ${id} not found`
            };
        }
        // Mock current time
        const currentTime = new Date().toISOString();
        return {
            success: true,
            time: currentTime,
            message: `Product with ID ${id} found`,
            product
        };
    }
};
// Initialize sample products
fakeProducts.initialize();
}),
"[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Avatar",
    ()=>Avatar,
    "AvatarFallback",
    ()=>AvatarFallback,
    "AvatarImage",
    ()=>AvatarImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Avatar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Avatar() from the server but Avatar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx <module evaluation>", "Avatar");
const AvatarFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarFallback() from the server but AvatarFallback is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx <module evaluation>", "AvatarFallback");
const AvatarImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarImage() from the server but AvatarImage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx <module evaluation>", "AvatarImage");
}),
"[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Avatar",
    ()=>Avatar,
    "AvatarFallback",
    ()=>AvatarFallback,
    "AvatarImage",
    ()=>AvatarImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Avatar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Avatar() from the server but Avatar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx", "Avatar");
const AvatarFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarFallback() from the server but AvatarFallback is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx", "AvatarFallback");
const AvatarImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarImage() from the server but AvatarImage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx", "AvatarImage");
}),
"[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Documents/zama/merces-front2/src/components/ui/card.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/lib/utils.ts [app-rsc] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecentSales",
    ()=>RecentSales
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/components/ui/avatar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/components/ui/card.tsx [app-rsc] (ecmascript)");
;
;
;
const salesData = [
    {
        name: 'Olivia Martin',
        email: 'olivia.martin@email.com',
        avatar: 'https://api.slingacademy.com/public/sample-users/1.png',
        fallback: 'OM',
        amount: '+$1,999.00'
    },
    {
        name: 'Jackson Lee',
        email: 'jackson.lee@email.com',
        avatar: 'https://api.slingacademy.com/public/sample-users/2.png',
        fallback: 'JL',
        amount: '+$39.00'
    },
    {
        name: 'Isabella Nguyen',
        email: 'isabella.nguyen@email.com',
        avatar: 'https://api.slingacademy.com/public/sample-users/3.png',
        fallback: 'IN',
        amount: '+$299.00'
    },
    {
        name: 'William Kim',
        email: 'will@email.com',
        avatar: 'https://api.slingacademy.com/public/sample-users/4.png',
        fallback: 'WK',
        amount: '+$99.00'
    },
    {
        name: 'Sofia Davis',
        email: 'sofia.davis@email.com',
        avatar: 'https://api.slingacademy.com/public/sample-users/5.png',
        fallback: 'SD',
        amount: '+$39.00'
    }
];
function RecentSales() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
        className: "h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardTitle"], {
                        children: "Recent Payments / Leads"
                    }, void 0, false, {
                        fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardDescription"], {
                        children: "Recent transaction activity in the payroll system."
                    }, void 0, false, {
                        fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-8",
                    children: salesData.map((sale, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Avatar"], {
                                    className: "h-9 w-9",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                            src: sale.avatar,
                                            alt: "Avatar"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                                            lineNumber: 60,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                            children: sale.fallback
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                                            lineNumber: 61,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                                    lineNumber: 59,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "ml-4 space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm leading-none font-medium",
                                            children: sale.name
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                                            lineNumber: 64,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-muted-foreground text-sm",
                                            children: sale.email
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                                            lineNumber: 65,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                                    lineNumber: 63,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "ml-auto font-medium",
                                    children: sale.amount
                                }, void 0, false, {
                                    fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, index, true, {
                            fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sales
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$constants$2f$mock$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/constants/mock-api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$features$2f$overview$2f$components$2f$recent$2d$sales$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/zama/merces-front2/src/features/overview/components/recent-sales.tsx [app-rsc] (ecmascript)");
;
;
;
async function Sales() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$constants$2f$mock$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["delay"])(3000);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$zama$2f$merces$2d$front2$2f$src$2f$features$2f$overview$2f$components$2f$recent$2d$sales$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RecentSales"], {}, void 0, false, {
        fileName: "[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__35b9f9d4._.js.map