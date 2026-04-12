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
    _isLocalHostname: function() {
        return _isLocalHostname;
    },
    createCorsMiddleware: function() {
        return createCorsMiddleware;
    }
});
const DEFAULT_ALLOWED_CORS_HOSTS = [
    'devtools'
];
const _isLocalHostname = (hostname)=>{
    if (hostname === 'localhost') {
        return true;
    }
    let maybeIp = hostname;
    const ipv6To4Prefix = '::ffff:';
    if (maybeIp.startsWith(ipv6To4Prefix)) {
        maybeIp = maybeIp.slice(ipv6To4Prefix.length);
    }
    if (maybeIp === '::1') {
        return true;
    } else if (/^127(?:.\d+){3}$/.test(maybeIp)) {
        return maybeIp.split('.').every((part)=>{
            const num = parseInt(part, 10);
            return num >= 0 && num <= 255;
        });
    } else {
        return false;
    }
};
function createCorsMiddleware(exp) {
    var _exp_extra_router, _exp_extra, _exp_extra_router1, _exp_extra1;
    const allowedHosts = [
        ...DEFAULT_ALLOWED_CORS_HOSTS
    ];
    // Support for expo-router API routes
    if ((_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_router = _exp_extra.router) == null ? void 0 : _exp_extra_router.headOrigin) {
        allowedHosts.push(new URL(exp.extra.router.headOrigin).host);
    }
    if ((_exp_extra1 = exp.extra) == null ? void 0 : (_exp_extra_router1 = _exp_extra1.router) == null ? void 0 : _exp_extra_router1.origin) {
        allowedHosts.push(new URL(exp.extra.router.origin).host);
    }
    return (req, res, next)=>{
        if (typeof req.headers.origin === 'string') {
            const { host, hostname } = new URL(req.headers.origin);
            const isSameOrigin = host === req.headers.host;
            const isLocalhost = _isLocalHostname(hostname);
            const isAllowedHost = allowedHosts.includes(host) || isLocalhost;
            if (!isSameOrigin && !isAllowedHost) {
                next(new Error(`Unauthorized request from ${req.headers.origin}. ` + 'This may happen because of a conflicting browser extension to intercept HTTP requests. ' + 'Disable browser extensions or use incognito mode and try again.'));
                return;
            } else if (!isLocalhost && isAllowedHost) {
                // Skipped for localhost to only allow requests from this dev-sever and not escalate
                // the cross-origin resource sharing that's allowed beyond the browser's defaults
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            }
            maybePreventMetroResetCorsHeader(req, res);
        }
        // Block MIME-type sniffing.
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    };
}
// When accessing source maps,
// metro will overwrite the `Access-Control-Allow-Origin` header with hardcoded `devtools://devtools` value.
// https://github.com/facebook/metro/blob/a7f8955e6d2424b0d5f73d4bcdaf22560e1d5f27/packages/metro/src/Server.js#L540
// This is a workaround to prevent this behavior.
function maybePreventMetroResetCorsHeader(req, res) {
    const pathname = req.url ? new URL(req.url, `http://${req.headers.host}`).pathname : '';
    if (pathname.endsWith('.map')) {
        const setHeader = res.setHeader.bind(res);
        res.setHeader = (key, ...args)=>{
            if (key !== 'Access-Control-Allow-Origin') {
                setHeader(key, ...args);
            }
            return res;
        };
    }
}

//# sourceMappingURL=CorsMiddleware.js.map