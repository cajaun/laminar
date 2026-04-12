// <link rel="preload" href="/_expo/static/css/xxxxxx.css" as="style">
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    appendLinkToHtml: function() {
        return appendLinkToHtml;
    },
    appendScriptsToHtml: function() {
        return appendScriptsToHtml;
    }
});
function appendLinkToHtml(html, links) {
    return html.replace('</head>', links.map((link)=>{
        let linkTag = `<link rel="${link.rel}"`;
        if (link.href) linkTag += ` href="${link.href}"`;
        if (link.as) linkTag += ` as="${link.as}"`;
        linkTag += '>';
        return linkTag;
    }).join('') + '</head>');
}
function appendScriptsToHtml(html, scripts) {
    return html.replace('</body>', scripts.map((script)=>`<script src="${script}" defer></script>`).join('') + '</body>');
}

//# sourceMappingURL=html.js.map