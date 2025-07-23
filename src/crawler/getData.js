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

    const list = await page.$$eval(selector, buttonList => buttonList.map(button => {
        // 从 img 标签的 src 属性中提取 ID
        const imgElement = button.querySelector('.item-image img')
        const src = imgElement?.src
        const match = src?.match(/\/([\w-]*)\.png/)
        const id = match && match[1]
        
        // 从 p.item-name 中获取名称
        const nameElement = button.querySelector('.item-name')
        const name = nameElement?.textContent?.trim()
        
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
    const selector = '.items-start>.item-wrapper'
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
