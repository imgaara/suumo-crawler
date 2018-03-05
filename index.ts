import { launch, Page } from "puppeteer";

async function start() {
  const browser = await launch();
  const page = await browser.newPage();
  try {
    page.setViewport({
      height: 768,
      width: 1280,
    });
    const suumo = new Suumo(page, "https://suumo.jp/chintai/jnc_000033422873/?bc=100115873406");
    const result = await suumo.init();
    console.log(result);
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}

start();

type ExtendedElement = Element & {
  innerText: string;
};

class Suumo {
  page: Page;
  loaded: Promise<any>;
  selector = {
    fee: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td.detailinfo-col.detailinfo-col--01 > div > div:nth-child(1) > span",
    manageFee: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td.detailinfo-col.detailinfo-col--01 > div > div:nth-child(2) > span",
    deposit: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td.detailinfo-col.detailinfo-col--02 > div > div:nth-child(1) > span:nth-child(2)",
    keyMoney: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td.detailinfo-col.detailinfo-col--02 > div > div:nth-child(2) > span:nth-child(2)",
    size: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td:nth-child(3) > div > div:nth-child(2)",
    destination: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td:nth-child(3) > div > div:nth-child(3)",
    type: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td:nth-child(4) > div > div:nth-child(1)",
    old: "#contents > div.detail_property > div.detail_property-body > div.detailinfo > table > tbody > tr > td:nth-child(4) > div > div:nth-child(2)",
    feature: "#bkdt-option > div > ul > li",
    stations: "#contents > div.detail_property > div.detail_property-body > div.l-detailnote > div > div.detailnote-value",
    // high: "//*[@id=\"contents\"]/div[5]/table/tbody/tr[2]/td[1]",
    // startFee: "//*[@id=\"contents\"]/div[5]/table/tbody/tr[9]/td/ul/li",
  };

  constructor(page: Page, url: string) {
    this.page = page;
    this.loaded = page.goto(url, { waitUntil: "networkidle2" });
  }

  async init() {
    const map: any = {};
    await this.loaded;
    for(const k in this.selector) {
      const text = await this.text((this.selector as any)[k]);
      map[k] = text.trim();
    }
    map.manageFee = map.manageFee.replace("管理費・共益費", "").trim();
    map.feature = (map.feature as string).split("、").map(s => s.trim());
    map.stations = (map.stations as string).split("\n").map(s => s.replace("[乗り換え案内]", "").trim());
    return map;
  }

  async text(selector: string) {
    return await this.page.evaluate((sl: string) => {
      const el = document.querySelector(sl) as ExtendedElement | null;
      if (el) {
        return el.innerText;
      }
      return "no element";
    }, selector) as string;
  }
}
