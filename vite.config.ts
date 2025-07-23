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
                author: 'KeyPJ',
                name: {
                    '': pkg.name,
                    'zh': '绝区零规划助手扩展',
                },
                description: {
                    'zh': '绝区零规划助手扩展，自动从米游社获取角色信息并导入至绝区零seelie规划工具'
                },
                namespace: 'https://github.com/KeyPJ/seelieEx',
                version: pkg.version,
                include: ["https://zzz.seelie.me/*"],
                grant: ['unsafeWindow', 'GM.xmlHttpRequest', 'GM_xmlhttpRequest', 'GM_openInTab', 'GM_getResourceText', "GM_registerMenuCommand"],
                $extra: [
                    ['copyright', '2021, KeyPJ https://github.com/KeyPJ'],
                ],
                license: 'MIT',
                contributionURL: 'https://github.com/KeyPJ/seelieEx',
                connect: ['api-takumi.mihoyo.com', 'public-data-api.mihoyo.com'],
                resource: {
                    zzz_character: "https://ghproxy.com/https://raw.githubusercontent.com/KeyPJ/seelieEx/main/src/data/zzz_character.json",
                    zzz_weapon: "https://ghproxy.com/https://raw.githubusercontent.com/KeyPJ/seelieEx/main/src/data/zzz_weapon.json"
                },
                "run-at": "document-end",
                homepage: "https://github.com/KeyPJ",
                homepageURL: "https://github.com/KeyPJ/seelieEx",
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
