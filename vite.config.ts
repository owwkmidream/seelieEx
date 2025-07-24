import pkg from './package.json';
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import monkeyPlugin from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        monkeyPlugin({
            entry: 'src/index.tsx',
            userscript: {
                author: 'Owwkmidream',
                name: {
                    '': pkg.name,
                    'zh': '绝区零规划助手扩展',
                },
                description: {
                    'zh': '绝区零规划助手扩展，自动从米游社获取角色信息并导入至绝区零seelie规划工具'
                },
                namespace: 'https://github.com/Owwkmidream/seelieEx',
                version: pkg.version,
                include: ["https://zzz.seelie.me/*"],
                grant: ['unsafeWindow', 'GM.xmlHttpRequest', 'GM_xmlhttpRequest', 'GM_openInTab', 'GM_getResourceText', "GM_registerMenuCommand"],
                $extra: [
                    ['copyright', '2025, Owwkmidream https://github.com/Owwkmidream'],
                ],
                license: 'MIT',
                contributionURL: 'https://github.com/Owwkmidream/seelieEx',
                connect: ['api-takumi.mihoyo.com', 'act-api-takumi.mihoyo.com', 'public-data-api.mihoyo.com'],
                resource: {
                    zzz_character: "https://cdn.jsdelivr.net/gh/Owwkmidream/seelieEx@main/src/data/zzz_character.json",
                    zzz_weapon: "https://cdn.jsdelivr.net/gh/Owwkmidream/seelieEx@main/src/data/zzz_weapon.json"
                },
                "run-at": "document-end",
                homepage: "https://github.com/Owwkmidream",
                homepageURL: "https://github.com/Owwkmidream/seelieEx",
                updateURL: "https://greasyfork.org/scripts/443664-genshinseelieex/code/genshinSeelieEx.user.js"
            },
            build: {
                fileName: "index.user.js",
                externalGlobals: {
                    react: [
                        'React',
                        (version) =>
                            `https://unpkg.zhimg.com/react@${version}/umd/react.production.min.js`,
                    ],
                    'react-dom': [
                        'ReactDOM',
                        (version) =>
                            `https://unpkg.zhimg.com/react-dom@${version}/umd/react-dom.production.min.js`,
                    ],
                },
            },
        }),
    ],
})
