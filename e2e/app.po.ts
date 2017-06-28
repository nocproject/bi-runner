import { browser, by, element } from 'protractor';

export class BiPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('bi-root h1')).getText();
  }
}
