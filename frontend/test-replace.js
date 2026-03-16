const fs = require('fs');
const path = 'src/hooks/use-confidential-balance.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
    /return \[\{ handle: balanceHandle as string, contractAddress: cardCusdcAddress as Hex \}\];/,
    "return [{ handle: balanceHandle as string, contractAddress: cardAddress as Hex }];"
);
fs.writeFileSync(path, code);
