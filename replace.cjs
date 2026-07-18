const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    
    // Pattern 1: $10, $5.99
    newContent = newContent.replace(/\$([0-9])/g, '₹$1');
    
    // Pattern 2: >$ or > $ inside JSX
    newContent = newContent.replace(/>\s*\$/g, match => match.replace('$', '₹'));
    
    // Pattern 3: \`$${price}\`
    newContent = newContent.replace(/\$\$\{/g, '₹${');
    
    // Pattern 4: <span>${price}</span>  where the literal $ is outside the interpolation
    // If we have >${price} it shouldn't have a literal $ unless it's >$${price} which we fixed above.
    // However if they wrote >${price} intending $ as literal text and {price} as interpolation,
    // wait, in JSX, >${price} literally outputs >${price}. 
    // They would write >${price} or <span>${price}</span>
    newContent = newContent.replace(/>\$\{/g, '>₹{');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log('Changed', file);
    }
});
console.log('Total changed:', changedCount);
