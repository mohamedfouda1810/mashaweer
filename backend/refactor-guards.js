const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.controller.ts') && !file.includes('auth.controller.ts')) {
      results.push(file);
    }
  });
  return results;
}

const controllers = walk(srcDir);

controllers.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Add import if needed
  const authGuardPath = path.relative(path.dirname(file), path.join(srcDir, 'modules', 'auth', 'guards', 'jwt-auth.guard')).replace(/\\/g, '/');
  const importString = `import { JwtAuthGuard } from '${authGuardPath.startsWith('.') ? authGuardPath : './' + authGuardPath}';\n`;

  if (!content.includes('import { JwtAuthGuard }') && (content.includes('@CurrentUser') || content.includes('@Roles'))) {
    content = importString + content;
  }

  // Ensure UseGuards is imported
  if (content.includes('@CurrentUser') || content.includes('@Roles')) {
    if (!content.includes('UseGuards')) {
      content = content.replace("import { Controller,", "import { Controller, UseGuards,");
    }
    // and sometimes it's on a new line or object destructuring
    if (content.match(/import \{[\s\S]*Controller[\s\S]*\} from '@nestjs\/common';/)) {
        if (!content.includes('UseGuards,')) {
            content = content.replace('Controller,', 'Controller,\n  UseGuards,');
        }
    }
  }

  // Replace @UseGuards(RolesGuard) with @UseGuards(JwtAuthGuard, RolesGuard)
  if (content.includes('@UseGuards(RolesGuard)')) {
    content = content.replace(/@UseGuards\(RolesGuard\)/g, '@UseGuards(JwtAuthGuard, RolesGuard)');
  }

  // Now, correctly prepend @UseGuards(JwtAuthGuard) to methods that have @CurrentUser but DO NOT have @Roles or @UseGuards
  // To be perfectly safe, we'll find every line with `@Get(` or `@Post(` or `@Delete(` or `@Patch(` or `@Put(`
  // Check if it has `@CurrentUser` in its parameter list.
  
  const methodRegex = /@(Get|Post|Put|Delete|Patch)\((.*?)\)([\s\S]*?)async\s+\w+\(([\s\S]*?)\)/g;
  
  content = content.replace(methodRegex, (match, methodType, methodArg, decorators, args) => {
      // If args contains @CurrentUser and there is no @UseGuards or @Roles in decorators
      if (args.includes('@CurrentUser') && !decorators.includes('@UseGuards') && !decorators.includes('@Roles')) {
          return `@UseGuards(JwtAuthGuard)\n  @${methodType}(${methodArg})${decorators}async \w+\((${args})\)`.replace(/async \w+\(\(/, `async ${match.split('async ')[1].split('(')[0]}(`);
      }
      return match;
  });

  // A more robust manual regex for methods with @CurrentUser but without @UseGuards
  const methodsWithCurrentUser = content.split('async ');
  for (let i = 1; i < methodsWithCurrentUser.length; i++) {
     let block = methodsWithCurrentUser[i];
     let openParams = block.indexOf('(');
     let closeParams = block.indexOf(')');
     let params = block.substring(openParams, closeParams);
     
     if (params.includes('@CurrentUser')) {
         // let's look at the previous chunk to see if it has @UseGuards
         let prevChunk = methodsWithCurrentUser[i-1];
         let lastDecoratorList = prevChunk.substring(prevChunk.lastIndexOf('@'));
         if (!lastDecoratorList.includes('@UseGuards') && !lastDecoratorList.includes('@Roles')) {
             // add @UseGuards(JwtAuthGuard) before the last HTTP method decorator
             let matchHttpDecorationInfo = prevChunk.lastIndexOf('@Get') || prevChunk.lastIndexOf('@Post') || prevChunk.lastIndexOf('@Delete');
             let httpDecIndex = Math.max(prevChunk.lastIndexOf('@Get'), prevChunk.lastIndexOf('@Post'), prevChunk.lastIndexOf('@Delete'), prevChunk.lastIndexOf('@Patch'), prevChunk.lastIndexOf('@Put'));
             if (httpDecIndex !== -1) {
                 methodsWithCurrentUser[i-1] = prevChunk.substring(0, httpDecIndex) + '@UseGuards(JwtAuthGuard)\n  ' + prevChunk.substring(httpDecIndex);
             }
         }
     }
  }
  
  content = methodsWithCurrentUser.join('async ');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
