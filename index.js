const fetch = require('node-fetch');
const FormData = require('form-data');
const ethers = require('ethers');
const { faker } = require('@faker-js/faker');
const fs = require('fs');

const { createWorker } = require('tesseract.js');

const worker = createWorker({
    //   logger: m => console.log(m)
});


// const trained_data = 'eng+hin'
const ReadText = (imgfile, oem, psm) => {

    const oem_var = oem || 2
    const psm_var = psm || 3

    try {
        return new Promise((resolve, reject) => {

            worker.load().then(() => {
                worker.loadLanguage('eng+osd').then(() => {
                    worker.initialize('eng+osd').then(() => {
                        worker.setParameters({
                            tessedit_ocr_engine_mode: oem_var,
                            tessedit_pageseg_mode: psm_var,
                            // tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                        }).then(() => {
                            worker.recognize(imgfile, {
                                // tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                            }).then(({ data: { text } }) => {
                                // console.log(text)
                                resolve(text)
                            }).finally(() => {
                                // worker.terminate()
                            })
                        })
                    });
                })
            })

        });

    }
    catch (e) {
        return `An error occurred: ${e}`
    }
}


const generateIndoName = () => {
    const randomName = faker.name.findName().toLowerCase();
    const random1 = faker.word.adjective().toLowerCase();
    const random2 = faker.word.adverb().toLowerCase();
    return random2.replace(/\s/g, "").toLowerCase() + randomName.replace(/\s/g, "")
};

const cookieHelpers = (arrayCookie) => {
    let newCookie = '';
    for (let index = 0; index < arrayCookie.length; index++) {
        const element = arrayCookie[index];
        if (index < arrayCookie.length - 1) {
            newCookie += element.split(';')[0] + '; ';
        } else {
            newCookie += element.split(';')[0];
        }

    }
    return newCookie
};

const getCookie = (reff) => new Promise((resolve, reject) => {
    fetch('https://temzu.com/airdrop?' + reff, {
        headers: {
            'authority': 'temzu.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'id-ID,id;q=0.9',
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        }
    })
        .then(res => {
            const cookie = cookieHelpers(res.headers.raw()['set-cookie']);
            resolve(cookie)
        })
        .catch(err => reject(err))

});

const getCaptcha = (reff, cookie) => new Promise((resolve, reject) => {
    fetch('https://temzu.com/clcapt.php', {
        headers: {
            'authority': 'temzu.com',
            'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'accept-language': 'id-ID,id;q=0.9',
            'cookie': cookie,
            'referer': 'https://temzu.com/airdrop?'+reff,
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'image',
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        }
    })
        .then(res => {
            const dest = fs.createWriteStream(`captcha.png`);
            res.body.pipe(dest);
            res.body.on('end', () => resolve());
            dest.on('error', reject);
        })
        .catch(err => reject(err))

});

const get = (address, nickname, cookie, reff, captcha) => new Promise((resolve, reject) => {
    console.log(address, nickname, cookie, reff, captcha)
    var form = new FormData();
    form.append('waddress', address);
    form.append('nickname', nickname);
    form.append('mpassw', 'Coegsekali');
    form.append('captcha', captcha.trim());
    form.append('gsmtype', 'airdrop');

    fetch('https://temzu.com/cpubot.php', {
        method: 'POST',
        headers: {
            'authority': 'temzu.com',
            'accept': '*/*',
            'accept-language': 'id-ID,id;q=0.9',
            'origin': 'https://temzu.com',
            'referer': 'https://temzu.com/airdrop?' + reff,
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
            'cookie': cookie
        },
        body: form
    })
        .then(res => res.text())
        .then(res => resolve(res))
        .catch(err => reject(err))

});

const readTextFromImage = () => new Promise((resolve, reject) => {

    ReadText('./captcha.png').then(text => {
        resolve(text)
    }).catch(err => {
        reject(err)
    })
});

(async () => {
    process.on('SIGINT', function() {
        worker.terminate();
        process.exit();  
    });

    const reffMu = 'xsrazy'
    while (true) {
        try {
            const getCookieResult = await getCookie(reffMu);
            const captchaResult = await getCaptcha(reffMu, getCookieResult);
            fs.createWriteStream('./captcha.png', captchaResult)
            const name = generateIndoName();
            const wallet = ethers.Wallet.createRandom()
            const captcha = await readTextFromImage();
            console.log(captcha)
            const getResult = await get(wallet.address, name, getCookieResult, reffMu, captcha);
            if (getResult.includes('newms')) {
                fs.appendFileSync('./temzu.txt', `${wallet.address}|${wallet.mnemonic.phrase}|${wallet.privateKey}|${name}|Coegsekali\n`)
            }
            console.log(getResult)
        } catch (e) { }
    }


})();
