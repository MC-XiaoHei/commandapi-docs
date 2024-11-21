import {repository, homepage} from '../../package.json';
import {defineConfig, UserConfig} from 'vitepress';
import {withI18n} from 'vitepress-i18n';
import {VitePressI18nOptions} from 'vitepress-i18n/dist/types';
import {VitePressSidebarOptions, withSidebar} from "vitepress-sidebar";

const defaultLocale: string = 'en';
const supportLocales: string[] = [defaultLocale, 'zhHans'];
const editLinkPattern = `${repository.url}/edit/master/docs/:path`;

const commonSidebarOptions: VitePressSidebarOptions = {
    collapsed: false,
    capitalizeFirst: true,
    useTitleFromFileHeading: true,
    useTitleFromFrontmatter: true,
    useFolderTitleFromIndexFile: true,
    sortMenusByFrontmatterOrder: true,
};

const vitepressOptions: UserConfig = {
    title: "CommandAPI",
    lastUpdated: true,
    description: "Docs of CommandAPI",
    cleanUrls: true,
    metaChunk: true,
    rewrites: {
        'en/:rest*': ':rest*'
    },
    sitemap: {
        hostname: homepage
    },
    themeConfig: {
        editLink: {
            pattern: editLinkPattern
        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/vuejs/vitepress'}
        ]
    },
    markdown: {
        container: {
            infoLabel: '**Developer\'s Note:**',
        },
        shikiSetup: (shiki) => {
            shiki.loadLanguage({
                name: "mccmd",
                scopeName: "source.mccmd",
                patterns: [{
                    name: "constant.language.mccmd",
                    match: "(?<=^\\/)[a-zA-Z0-9]+"
                }, {
                    name: "entity.name.tag.mccmd",
                    match: "@[aeprs](\\[.+\\])?"
                }, {
                    name: "variable.mccmd",
                    match: "-?[0-9]+"
                }, {
                    name: "comment.mccmd",
                    match: "<[^>]+>"
                }, {
                    name: "entity.mccmd",
                    match: "\\b(align|anchored|as|at|facing|in|positioned|rotated|run|if|store|result|score|matches)\\b"
                }]
            })
        }
    }
}

const vitePressI18nOptions: VitePressI18nOptions = {
    locales: supportLocales,
    rootLocale: defaultLocale,
    searchProvider: 'local',
    themeConfig: {
        en: {
            nav: [
                {
                    text: 'Introduction',
                    link: '/intro'
                },
            ]
        },
        zhHans: {
            nav: [
                {
                    text: '介绍',
                    link: '/zhHans/intro'
                },
            ]
        }
    }
};

const vitepressSidebarOptions = [
    ...supportLocales.map((lang) => {
        return {
            ...commonSidebarOptions,
            documentRootPath: `/docs/${lang}`,
            resolvePath: defaultLocale === lang ? '/' : `/${lang}/`,
            ...(defaultLocale === lang ? {} : {basePath: `/${lang}/`})
        };
    })
];

export default defineConfig(withSidebar(withI18n(vitepressOptions, vitePressI18nOptions), vitepressSidebarOptions))