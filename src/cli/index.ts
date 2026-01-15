import { Lang, parse, registerDynamicLanguage } from '@ast-grep/napi';
//import csharp from '@ast-grep/lang-csharp';
//registerDynamicLanguage({ csharp });

const ast = parse(Lang.TypeScript, "var s = 1; Console.WriteLine(s);");
const root = ast.root()
var result = root.find("Console.WriteLine");
console.log(result);
