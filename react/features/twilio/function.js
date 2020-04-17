import jwtDecode from 'jwt-decode';

export function getTokenWithJwt(jwt, jwtHost) {
    const headers = new Headers({
        'Content-Type': 'application/json'
    });
    const params = new window.URLSearchParams({ jwt });
    return new Promise(((resolve, reject) => {
        fetch(`https://${jwtHost}/video_chat_sessions/token?${params}`, { headers })
            .then(res => {
                if (res.status == 500 || res.status == 401) {
                    reject(res);
                } else {
                    resolve(res.json());
                }
            })
            .catch(error => {
                reject(error);
            });
    }));
}

export async function getTokenFromJane(deepLink) {
    const url = deepLink.url;
    const jwt = _getJwtFromDeepLink(url);
    const jwtHost = _getJwtHost(url);
    return await getTokenWithJwt(jwt, jwtHost);
}

function _getJwtFromDeepLink(url) {
    return url.split('/jwt/')[1].split('/')[0];
}

function _getJwtHost(url) {
    const deepLinkParamsArr = url.split('/');
    return deepLinkParamsArr[deepLinkParamsArr.length - 1];
}

export function getCurrentUserInfo(jwt) {
    const jwtPayload = jwtDecode(jwt);
    return jwtPayload && jwtPayload.grants
}
