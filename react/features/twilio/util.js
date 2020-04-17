import jwtDecode from 'jwt-decode';

export function _getJwtFromDeepLink(url) {
    return url && url.split('/jwt/')[1].split('/')[0];
}

export function _getJwtHost(url) {
    const deepLinkParamsArr = url.split('/');
    return deepLinkParamsArr[deepLinkParamsArr.length - 1];
}

export function getCurrentUserInfo(jwt) {
    const jwtPayload = jwtDecode(jwt);
    return jwtPayload && jwtPayload.grants;
}

export function getInfoFromDeepLinkJwt(deeplink, attr) {
    const url = deeplink.url;
    const jwt = _getJwtFromDeepLink(url);
    const jwtPayload = jwtDecode(jwt);
    return jwt && jwtPayload[attr] || '';
}
