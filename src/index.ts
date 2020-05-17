import * as path from 'path'
import * as fs from 'fs'
import { AttributeClassDefinition, IntrinsicElementDefinition } from './JSXExporter';
import JSXDocumentRenderer from "./JSXDocumentRenderer";
import NativescriptCoreJSXExporter from './NativescriptCoreJSXExporter';
import NativescriptPluginJSXExporter from './NativescriptPluginJSXExporter';
import { SvelteJSXDocumentRenderer } from './SvelteJSXDocumentRenderer';

const nativescriptSourcePath = path.resolve(__dirname, "../nativescript_src/nativescript-core");

class ReactJSXDocumentRenderer extends JSXDocumentRenderer {
    renderClass(classDefinition: AttributeClassDefinition): string {
        let rendered = super.renderClass(classDefinition);
        return rendered.replace(/^type /m, "export type ");
    }

    renderJSXNamespace(intrinsicElements: IntrinsicElementDefinition[]) {
        return ''
    }

    /**
     * This will render the React implementation for the plugin, based on an existing NativeScript Core plugin.
     * 
     * @param packageName - The name of the package as it is on npm, e.g. "nativescript-ui-sidedrawer"
     * @param exportName - The name of the export from the package, e.g. "RadSideDrawer"
     * @param extendedClass - The name of the class that the UI plugin extends, e.g. "View"
     * 
     * React NativeScript registers views in much the same way as Vue does.
     * @see https://github.com/rigor789/nativescript-vue-next/blob/master/packages/runtime/src/registry.ts
     */
    renderImplementation(
        packageName: string,
        exportName: string,
        extendedClass: string,
    ): string {
        const tagName: string = exportName[0].toLowerCase() + exportName.slice(1);

        let meta: string;
        if(extendedClass === "ContentView"){
            meta = `    {
      viewFlags: NSVViewFlags.CONTENT_VIEW,
    }`;
        } else if(extendedClass === "LayoutBase"){
            meta = `    {
      viewFlags: NSVViewFlags.LAYOUT_VIEW,
    }`;
        /* TODO: handle this case. NativeScript Vue's Node model doesn't seem to handle it yet. */
        // } else if(extendedClass === "TextBase"){
        } else {
            /*
             * e.g. The case if it extends View.
             * Ideally we should infer potential relationships. SideDrawer has two properties:
             *   drawerContent?: string | View;
             *   mainContent?: string | View;
             * 
             */
            meta = `    {
      nodeOps: {
        insert(child: NSVElement, parent: NSVElement, atIndex?: number): void {
          // You need to fill this in!
        },
        remove(child: NSVElement, parent: NSVElement): void {
          // You need to fill this in!
        }
      }
    }`;
        }


        return `import { registerElement, NSVElement, NSVViewFlags } from "react-nativescript";

registerElement(
    '${tagName}',
    () => require('${packageName}')["${exportName}"],
    ${meta}
);
`
    }
}

function exportCore() {
    console.log("Exporting core")
    let jsxExporter = NativescriptCoreJSXExporter.FromSourcePath(nativescriptSourcePath);
    let jsxDoc = jsxExporter.buildJSXDocument();
    let svelteRenderer = new SvelteJSXDocumentRenderer();
    fs.writeFileSync("./svelte-native-defs/svelte-native-jsx-nativescript-core.d.ts", svelteRenderer.render(jsxDoc));
    
    //RNS doesn't want the style attribute
    jsxDoc.imports.filter(i => i.alias != "Style");

    for (let c of jsxDoc.classDefinitions) {
        if (c.className == "ViewBaseAttributes") {
            c.props = c.props.filter(p => p.name != "style")
        }
    }
    let rnsRenderer = new ReactJSXDocumentRenderer();
    fs.writeFileSync("./react-nativescript-defs/react-nativescript-jsx.ts", rnsRenderer.render(jsxDoc));
}

function exportModule(moduleName: string) {
    console.log(`Exporting ${moduleName}`)
    const pluginExporter = NativescriptPluginJSXExporter.FromNodeModule(moduleName);
    let svelteRenderer = new SvelteJSXDocumentRenderer();
    let rnsRenderer = new ReactJSXDocumentRenderer();
    let doc = pluginExporter.buildJSXDocument()
   
    fs.writeFileSync(`./svelte-native-defs/svelte-native-jsx-${moduleName}.d.ts`, svelteRenderer.render(doc));
    if(moduleName === "nativescript-ui-sidedrawer"){
        const implementation: string = rnsRenderer.renderImplementation(
            moduleName,
            "RadSideDrawer",
            "View"
        );
        fs.writeFileSync(`./react-nativescript-defs/react-nativescript-jsx-${moduleName}.ts`, rnsRenderer.render(doc) + "\n\n" + implementation);
    } else {
        fs.writeFileSync(`./react-nativescript-defs/react-nativescript-jsx-${moduleName}.ts`, rnsRenderer.render(doc));
    }
}


fs.mkdirSync("./svelte-native-defs", { recursive: true});
fs.mkdirSync("./react-nativescript-defs", { recursive: true});

exportCore()
exportModule("nativescript-ui-sidedrawer")
exportModule("nativescript-ui-listview")
exportModule("nativescript-ui-chart")
