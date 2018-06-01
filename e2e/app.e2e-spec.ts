import { BiPage } from './app.po';

describe('bi App', () => {
  let page: BiPage;

  beforeEach(() => {
    page = new BiPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('bi works!');
  });
});
