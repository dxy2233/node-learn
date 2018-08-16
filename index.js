const Koa = require('koa');
const Router = require('koa-router');
const cheerio = require('cheerio');
const superagent = require('superagent');
const fs = require("fs");

const app = new Koa();
const router = new Router();

//求差集arr1-arr2
const arrayMinus = (arr1,arr2) => {
  var result=[];
  arr1.forEach(function(x){
      if(arr2.indexOf(x)===-1){
          result.push(x);
      }else{
          return;
      }
  })
  return result;
}

//文件名
const aName = 'a.txt'
const bName = 'b.txt'

//创建、更新txt文件
const txt = (name, itemsNew) => {
  fs.exists(`file/${name}${aName}`, exists => {
    if (exists) {
      let itemsOld = fs.readFileSync(`file/${name}${aName}`).toString().split('\r\n')
      let itemsMinus = arrayMinus(itemsNew, itemsOld)
      console.log(`比对${name}ok`);
      if (itemsMinus.length > 0) {
        fs.writeFile(`file/${name}${aName}`, itemsNew.join('\r\n'), err => {
          if (err) {
            return console.log(err);
          }
        })
        fs.writeFile(`file/${name}${bName}`, itemsMinus.join('\r\n'), err => {
          if (err) {
            return console.log(err);
          }
        })
        console.log(`更新${name}ok`);
      }
    }
    if (!exists) {
      fs.writeFile(`file/${name}${aName}`, itemsNew.join('\r\n'), err => {
        if (err) {
          return console.log(err);
        }
      })
      fs.writeFile(`file/${name}${bName}`, '', err => {
        if (err) {
          return console.log(err);
        }
      })
      console.log(`创建${name}ok`);
    }
  })
}

//友邦
const youbang = async (url, name) => {
  superagent.get('http://www.aia.com.cn/zh-cn/aia/media/gongkaixinxipilou/chanpinjibenxinxi.html')
    .then(res => {
      let $ = cheerio.load(res.text)
      let items = []
      $('table tbody tr').each((i, elem) => {
        items.push(
          $(elem).children().eq(0).text() + '-' +
          $(elem).children().eq(1).text() + '-' +
          $(elem).children().eq(5).text()
        )
      })
      txt('友邦', items)
    })
    .catch(err => {
      console.log(err);
    })
}

//太平洋
const taipingyang = async (url, name) => {
  let items = []
  superagent.get(`http://life.cpic.com.cn/xrsbx/gkxxpl/jbxx/gsgk/jydbxcpmljtk/${url}/index.shtml`)
    .then(res => {
      let $ = cheerio.load(res.text)
      let pages = $('.z_num').eq(-2).text()
      $('.trHover').each((i, elem) => {
        items.push(
          $(elem).children().eq(1).children().eq(0).text()
        )
      })
      return parseInt(pages)
    })
    .then(async pages => {
      for(let i = 2; i < pages + 1; i++) {
        await superagent.get(`http://life.cpic.com.cn/xrsbx/gkxxpl/jbxx/gsgk/jydbxcpmljtk/${url}/index_${i}.shtml`)
          .then(res => {
            let $ = cheerio.load(res.text)
            $('.trHover').each((i, elem) => {
              items.push(
                $(elem).children().eq(1).children().eq(0).text()
              )
            })
          })
      }
    }).then(res => {
      txt(name, items)
    })
}

//中国平安
//SALES_STATUS 01为新产品 02为在售 03为停售
const pingan = async () => {
  let items = []
  await superagent.get('http://life.pingan.com/life_insurance/elis.pa18.commonQuery.visit')
    .query({ requestid: 'com.palic.elis.pos.intf.biz.action.PosQueryAction.queryPlanClause' })
    .query({ SALES_STATUS: '01' })
    .then(res => {
      let $ = cheerio.load(res.text)
      $('map').each((i, elem) => {
        items.push(
          $(elem).children().eq(3).text() + '-' +
          $(elem).children().eq(7).text() + '-' +
          $(elem).children().eq(0).text() + '-新品'
        );
      })
    })
  await superagent.get('http://life.pingan.com/life_insurance/elis.pa18.commonQuery.visit')
    .query({ requestid: 'com.palic.elis.pos.intf.biz.action.PosQueryAction.queryPlanClause' })
    .query({ SALES_STATUS: '02' })
    .then(res => {
      let $ = cheerio.load(res.text)
      $('map').each((i, elem) => {
        items.push(
          $(elem).children().eq(3).text() + '-' +
          $(elem).children().eq(7).text() + '-' +
          $(elem).children().eq(0).text() + '-在售'
        );
      })
    })
  await superagent.get('http://life.pingan.com/life_insurance/elis.pa18.commonQuery.visit')
    .query({ requestid: 'com.palic.elis.pos.intf.biz.action.PosQueryAction.queryPlanClause' })
    .query({ SALES_STATUS: '03' })
    .then(res => {
      let $ = cheerio.load(res.text)
      $('map').each((i, elem) => {
        items.push(
          $(elem).children().eq(3).text() + '-' +
          $(elem).children().eq(7).text() + '-' +
          $(elem).children().eq(0).text() + '-停售'
        );
      })
    })
  txt('平安', items)
}
const pinganWeb = async () => {
  let items = []
  superagent.get('https://life.pingan.com/app_js/pingan/v20/life/wxgf.js')
    .then(res => {
      let data = res.text.split(';')
      let zs = JSON.parse(data[0].substr(data[0].indexOf('['), data[0].lastIndexOf(']')-62))
      let ts = JSON.parse(data[1].substr(data[1].indexOf('['), data[1].lastIndexOf(']')-65))
      zs.map((item, index, arr) => {
        items.push(
          item.planCode + '-' +
          item.clauseName + '-起' +
          item.startDate + '-停' +
          item.endDate + '-' +
          item.planSalesStatus
        )
      })
      return ts
    })
    .then(ts => {
      ts.map((item, index, arr) => {
        items.push(
          item.planCode + '-' +
          item.clauseName + '-起' +
          item.startDate + '-停' +
          item.endDate + '-' +
          item.planSalesStatus
        )
      })
      txt('平安互联网产品', items)
    })
    .catch(err => {
      console.log(err);
    })
}


router.get('/', async (ctx, next) => {
    youbang()

    taipingyang('zbcp/sx', '太平洋在办寿险')
    taipingyang('zbcp/nj', '太平洋在办年金')
    taipingyang('zbcp/ywx', '太平洋在办意外险')
    taipingyang('zbcp/jkx', '太平洋在办健康险')
    taipingyang('tbcp/sx', '太平洋停办寿险')
    taipingyang('tbcp/nj', '太平洋停办年金')
    taipingyang('tbcp/ywx', '太平洋停办意外险')
    taipingyang('tbcp/jkx', '太平洋停办健康险')

    pingan()
    pinganWeb()
  })

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
  console.log(`run 3000`);
});
