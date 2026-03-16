const fs = require('fs');
const path = 'src/hooks/use-confidential-balance.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
    /}, \[cardCusdcAddress, balanceHandle\]\);/,
    "}, [cardAddress, cardCusdcAddress, balanceHandle]);"
);
fs.writeFileSync(path, code);
