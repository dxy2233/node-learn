const Koa = require('koa');
const Router = require('koa-router');
const cheerio = require('cheerio');
const superagent = require('superagent');
const fs = require("fs");

const app = new Koa();
const router = new Router();

router
  // .get('/', async (ctx, next) => {
  //   await superagent.get('http://www.aia.com.cn/zh-cn/aia/media/gongkaixinxipilou/zaishou/geren-shouxian.html')
  //     .then(res => {
  //       var $ = cheerio.load(res.text);
  //       var items = [];
  //       $('table tbody tr').each((i, elem) => {
  //         items.push(
  //           $(elem).children().eq(1).text()
  //         )
  //       })
  //       items = items.join('<br/>');
  //       ctx.body = `<h2>友邦在售意外险</h2>${items}`;
  //     })
  // })

  .get('/', async (ctx, next) => {
    await superagent.get('http://www.aia.com.cn/zh-cn/aia/media/gongkaixinxipilou/chanpinjibenxinxi.html')
      .then(res => {
        let $ = cheerio.load(res.text)
        let items = []
        let itemsOld = []
        $('table tbody tr').each((i, elem) => {
          items.push(
            $(elem).children().eq(1).text() + '-' +
            $(elem).children().eq(5).text()
          )
        })
        items = items.join('\n')

        itemsOld = fs.readFileSync('file.js').toString().split('\n')
        itemsOld = itemsOld.join('<br/>')
        ctx.body = `<h2>友邦</h2>${itemsOld}`

        // fs.readFile('file.js', (err, data) => {
        //   if (err) {
        //     return console.log(err);
        //   }
        //   itemsOld.push(data.toString())
        // })
        // ctx.body = itemsOld

        // fs.writeFile('file.js', items, err => {
        //   if (err) {
        //     return console.log(err);
        //   }
        //   console.log('the file was saved!');
        // })
        // ctx.body = `<h2>友邦</h2>${items}`
      })
      .catch(err => {
        console.log(err);
      })
  })

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
  console.log(`run 3000`);
});
