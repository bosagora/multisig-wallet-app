import CreateMSWallet from '../pages/CreateMSWallet';
import LoginComponent from '../pages/LoginComponent';

describe('Test User Login', () => {
  it('Loads the Explore page', function () {
    cy.visit('/');
    cy.log('rc', this.runId, this.testData);
    const loginComponent = new LoginComponent();
    loginComponent.connectMetamask();
    loginComponent.shouldBeConnected();

    const createDAO = new CreateMSWallet();
    createDAO.goToCreateDAOPage();
    cy.wrap({...this.testData, x: 1}).as('testData');
  });
});
