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
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/zama/merces-front2/src/app/dashboard/overview/@sales/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__63b083ef._.js.map