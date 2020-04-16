// const testUrl = 'https://video-twilio.jane.qa/jwt/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZWF2ZV91cmwiOiIvL3BhdGNoLXJlbGVhc2UtMi1xYS5qYW5lLnFhLy92aWRlb19jaGF0X3Nlc3Npb25zLzE2L3BhcnRpY2lwYW50X2xlZnQiLCJzdXJ2ZXlfdXJsIjoiLy9wYXRjaC1yZWxlYXNlLTItcWEuamFuZS5xYS8vdmlkZW9fY2hhdF9zZXNzaW9ucy8xMTBjb3JhbGh1bW1pbmdiaXJkL3N1cnZleT9wYXJ0aWNpcGFudF9pZD05JnBhcnRpY2lwYW50X3R5cGU9U3RhZmZNZW1iZXIiLCJyb29tX25hbWUiOiIxMTBjb3JhbGh1bW1pbmdiaXJkIiwicGFydGljaXBhbnRfbmFtZSI6IlJlYmVjY2EgUm93ZSIsInBhcnRpY2lwYW50X3R5cGUiOiJTdGFmZk1lbWJlciIsInBhcnRpY2lwYW50X2lkIjo5LCJ2aWRlb19jaGF0X3Nlc3Npb25faWQiOjE2LCJleHAiOjE1ODcwMzM5MDB9.8Alw5077iPhihpDXUisXEgAK1TVGvRATW_Uk3t5vVM8/host/patch-release-2-qa.jane.qa';

export function getTokenWithJwt(jwt, jwtHost) {
    const headers = new Headers({
        'Content-Type': 'application/json'
    });
    const params = new window.URLSearchParams({ jwt });
    return new Promise(((resolve, reject) => {
        // fetch(`https://${jwtHost}/video_chat_sessions/token?${params}`, { headers })
        //     .then(res => {
        //         if (res.status == 500 || res.status == 401) {
        //             reject(res);
        //         } else {
        //             resolve(res.json());
        //         }
        //     })
        //     .catch(error => {
        //         reject(error);
        //     });
    }));
}

export async function getTokenFromJane(deepLink) {
    const url = deepLink.url;
    const jwt = _getJwtFromDeepLink(url);
    const jwtHost = _getJwtHost(url);
    return await getTokenWithJwt(jwt, jwtHost);
}

function _getJwtFromDeepLink(url) {
    // return testUrl.split('/jwt/')[1].split('/')[0];
    return url.split('/jwt/')[1].split('/')[0];
}

function _getJwtHost(url) {
    // const deepLinkParamsArr = testUrl.split('/');
    const deepLinkParamsArr = url.split('/');
    return deepLinkParamsArr[deepLinkParamsArr.length - 1];
}
