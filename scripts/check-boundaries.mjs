import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(filename)
      : /\.(ts|tsx)$/.test(entry.name)
        ? [filename]
        : [];
  });
}

function identity(filename) {
  const parts = path.relative(root, filename).split(path.sep);
  const layer = parts[0];
  if (!layers.includes(layer)) return null;
  let boundary;
  if (layer === 'app') boundary = ['app'];
  else if (layer === 'shared')
    boundary =
      parts[1] === 'ui' || parts[1] === 'lib'
        ? parts.slice(0, 3)
        : parts.slice(0, 2);
  else boundary = parts.slice(0, 2);
  return {
    layer,
    boundary: boundary.join('/'),
    base: path.join(root, ...boundary),
  };
}

function resolveImport(filename, specifier) {
  if (specifier.startsWith('@/')) return path.join(root, specifier.slice(2));
  if (specifier.startsWith('.'))
    return path.resolve(path.dirname(filename), specifier);
  if (specifier.startsWith('src/')) return path.join(root, specifier.slice(4));
  return null;
}

const violations = [];
for (const filename of sourceFiles(root)) {
  if (filename.endsWith('.d.ts')) continue;
  const source = ts.createSourceFile(
    filename,
    fs.readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const from = identity(filename);
  function inspect(node) {
    let specifier;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      specifier = node.moduleSpecifier.text;
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      specifier = node.arguments[0].text;
    if (specifier) {
      const target = resolveImport(filename, specifier);
      const to = target && identity(target);
      const errors = [];
      if (from && to) {
        if (layers.indexOf(to.layer) < layers.indexOf(from.layer))
          errors.push('imports a higher layer');
        if (
          to.layer === from.layer &&
          !['app', 'shared'].includes(from.layer) &&
          from.boundary !== to.boundary
        )
          errors.push('imports a sibling slice');
        if (from.boundary === to.boundary && specifier.startsWith('@/'))
          errors.push('use a relative import within the same slice/segment');
        if (
          from.boundary !== to.boundary &&
          to.layer !== 'app' &&
          target !== to.base &&
          target !== path.join(to.base, 'index') &&
          target !== path.join(to.base, 'index.ts')
        )
          errors.push('bypasses the target public API');
      }
      if (errors.length) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart());
        violations.push(
          `${path.relative(root, filename)}:${line + 1} ${specifier}: ${errors.join('; ')}`,
        );
      }
    }
    ts.forEachChild(node, inspect);
  }
  inspect(source);
}

if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('FSD import boundaries passed.');
}
