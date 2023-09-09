// THIS FILE IS CRITICAL, DO NOT TOUCH UNLESS YOU KNOW WHAT YOU'RE DOING
import { load } from './settings.js';
import Games from './games.js';
import Apps from './apps.js';
import Frame from './frame.js';
import AppPlayer from './appplayer.js';
import WPM from './wpm.js';
import PolarisError from './error.js';

const Settings = {
    load: load
};

fetch('/assets/misc/nav.html')
    .then(res => res.text())
    .then(content => {
        document.body.insertAdjacentHTML('afterbegin', content);

        if (window.self !== window.top) {
            window.parent.postMessage('loaded', location.origin);
        }
    }).catch(e => {
        new PolarisError('Failed to load navbar <a href="" onclick"javascript:location.reload();" data-link="true"><button>Reload</button></a>');
    });

onbeforeunload = (e) => {
    if (localStorage.getItem('prevent_close') === 'true') {
        e.preventDefault();
        
        return e;
    }

    sessionStorage.clear();
}

var previousLocation = location.pathname;

const urlchange = setInterval(() => {
    if (location.pathname !== previousLocation) {
        const frame = document.createElement('iframe');
        frame.src = location.pathname
        frame.style = 'display: none';
        document.body.appendChild(frame);

        frame.contentWindow.addEventListener('DOMContentLoaded', () => {
            document.body.style.display = 'none';

            window.onmessage = (e) => {
                if (e.data == 'loaded') {
                    window.history.pushState({}, '', location.pathname);
                    document.documentElement.innerHTML = frame.contentWindow.document.documentElement.innerHTML;
                    document.body.style.display = 'none';

                    Settings.load();
                    registerLinks();

                    if (location.pathname === '/games') Games.load();

                    if (location.pathname === '/apps') Apps.load();

                    if (location.pathname === '/search') WPM.load();

                    setTimeout(() => {
                        document.body.style.display = 'block';
                    }, 500);
                }
            }
        });
    }

    previousLocation = location.pathname;
}, 1);

window.onhashchange = () => {
    if (location.hash === '#settings') document.querySelector('.sidebar').classList.add('active');
    else document.querySelector('.sidebar').classList.remove('active');
};

const registerLinks = () => {
    document.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
            if (a.dataset.link !== 'true') {
                e.preventDefault();

                if (a.href.startsWith(location.origin)) {
                    if (window.location.href !== a.href) {
                        const frame = document.createElement('iframe');
                        frame.src = a.href;
                        frame.style = 'display: none';
                        document.body.appendChild(frame);

                        frame.contentWindow.addEventListener('DOMContentLoaded', () => {
                            document.body.style.display = 'none';

                            window.onmessage = (e) => {
                                if (e.data == 'loaded') {
                                    window.history.pushState({}, '', a.href);
                                    document.documentElement.innerHTML = frame.contentWindow.document.documentElement.innerHTML;
                                    document.body.style.display = 'none';

                                    Settings.load();
                                    registerLinks();

                                    if (location.pathname === '/games') Games.load();
                                    if (location.pathname === '/apps') Apps.load();
                                    if (location.pathname === '/search') WPM.load();

                                    setTimeout(() => document.body.style.display = 'block', 500);
                                }
                            }
                        });
                    }
                } else {
                    a.setAttribute('data-link', 'true');
                    a.click();
                }
            }
        }
    });
}

if (window.self === window.top) {
    setTimeout(() => {
        Settings.load();
        registerLinks();

        if (location.pathname === '/games') Games.load();
        if (location.pathname === '/apps') Apps.load();
        if (location.pathname === '/search') WPM.load();
        if (location.pathname === '/play') Frame.load();
        if (location.pathname === '/appplayer') AppPlayer.load();
    }, 500);
}

if (location.pathname === '/') {
    fetch('/assets/JSON/games.json')
        .then(res => res.json())
        .then(games => {
            const randomID = 1; // :3
            const game = games[randomID];

            document.querySelector('.featuredimg').addEventListener('click', function () {
                window.location.href = '/play?id=' + randomID;
            });
            document.querySelector('.featuredimg').src = game.image;
        }).catch(e => new PolarisError('Failed to load featured game'));
}


const Polaris = { Settings, Games, Apps, WPM, PolarisError, registerLinks };

export default Polaris;
