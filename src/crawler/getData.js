const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function getPageData(page, url, selector) {
    await page.goto(url, {
        waitUntil: 'domcontentloaded'
    })

    //等待加载完毕
    await page.waitForSelector('#main button')

    await page.click('#main button')

    const list = await page.$$eval(selector, relativeList => relativeList.map(relative => {
        const scr = relative?.firstElementChild?.firstElementChild?.src
        const match = scr?.match(/(\/([\w-]*)\.png)/)
        const id = match && match[2]
        const name = relative.innerText
            .replace("NEW", "")
            .replace("SOON", "")
            .replace("Custom", "")
            .replace("自定义", "")
            .replace("即将上线", "")
            .replaceAll("\n", "")
        if (!id || !name) {
            return null
        }
        return {id, name}
    }))

    //排序
    return list.filter(a => !!a).sort((a, b) => a.name.localeCompare(b.name, 'zh'))
}

const scrape = async () => {
    const browser = await puppeteer.launch({headless: true, devtools: false})
    const page = await browser.newPage()
    await page.evaluateOnNewDocument(() => { //在每个新页面打开前执行以下脚本
        const newProto = navigator.__proto__
        delete newProto.webdriver  //删除navigator.webdriver字段
        navigator.__proto__ = newProto
        Object.defineProperty(navigator, 'userAgent', {  //userAgent在无头模式下有headless字样，所以需覆写
            get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
        })
        //浏览器设置中文
        Object.defineProperty(navigator, "language", {
            get: function () {
                return "zh-CN"
            }
        })
        Object.defineProperty(navigator, "languages", {
            get: function () {
                return ["zh-CN", "zh"]
            }
        })
    })
    const zzz_charactersUrl = 'https://zzz.seelie.me/characters'
    const selector = '.items-start>.relative'
    const zzz_characters = await getPageData(page, zzz_charactersUrl, selector)
    console.log(zzz_characters)

    const zzz_weaponsUrl = 'https://zzz.seelie.me/weapons'
    const zzz_weapons = await getPageData(page, zzz_weaponsUrl, selector)
    console.log(zzz_weapons)

    await browser.close()
    return {zzz_characters, zzz_weapons}
}

scrape().then((value) => {
    const {zzz_characters, zzz_weapons} = value
    fs.writeFileSync(path.join(__dirname, '../data/zzz_character.json'), JSON.stringify(zzz_characters, "", "\t"))
    fs.writeFileSync(path.join(__dirname, '../data/zzz_weapon.json'), JSON.stringify(zzz_weapons, "", "\t"))
}).catch(err => console.error(err))
