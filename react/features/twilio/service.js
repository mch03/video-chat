import { _getJwtFromDeepLink, _getJwtHost } from './util';

export function sendBeaconRn(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        },
        body: data
    });
}

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
