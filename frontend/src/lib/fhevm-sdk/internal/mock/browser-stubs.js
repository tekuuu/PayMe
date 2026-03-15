// This is a robust stub for node modules in the browser
const emptyFn = () => '';
const pathStub = {
    join: (...args) => args.filter(Boolean).map(String).join('/'),
    dirname: (p) => {
        if (typeof p !== 'string') return '.';
        const parts = p.split('/');
        if (parts.length <= 1) return '.';
        parts.pop();
        return parts.join('/') || '.';
    },
    resolve: (...args) => args.filter(Boolean).map(String).join('/'),
    basename: (p) => {
        if (typeof p !== 'string') return '';
        return p.split('/').pop() || '';
    },
    extname: (p) => {
        if (typeof p !== 'string') return '';
        const base = p.split('/').pop() || '';
        const idx = base.lastIndexOf('.');
        return idx < 0 ? '' : base.slice(idx);
    },
    posix: null,
    sep: '/',
    delimiter: ':',
};
pathStub.posix = pathStub;

const handler = {
    get: (target, prop) => {
        if (prop in target) return target[prop];
        if (prop === 'default') return stub;
        return emptyFn;
    }
};

const stub = new Proxy(pathStub, handler);

export default stub;
if (typeof module !== 'undefined') {
    module.exports = stub;
}


