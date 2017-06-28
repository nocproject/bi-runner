import { BiPage } from './app.po';

describe('bi App', () => {
  let page: BiPage;

  beforeEach(() => {
    page = new BiPage();
  });

  it('should display text saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('bi works!');
  });
});
