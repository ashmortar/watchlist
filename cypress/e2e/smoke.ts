import faker from "@faker-js/faker"

describe.skip(`smoke tests`, () => {
  afterEach(() => {
    cy.cleanupUser()
  })

  it(`should allow you to register and login`, () => {
    const username = faker.internet.userName()
    const loginForm = {
      email: `${username}@example.com`,
      username,
      password: faker.internet.password(),
    }
    cy.then(() => ({ email: loginForm.email })).as(`user`)

    cy.visit(`/`)
    cy.findByTestId(`join-button`).click()
    cy.findByRole(`textbox`, { name: /username/i }).type(loginForm.username)
    cy.findByRole(`textbox`, { name: /email/i }).type(loginForm.email)
    cy.findByLabelText(/password/i).type(loginForm.password)

    cy.findByRole(`button`, { name: /Sign up/i }).click()

    cy.findByTestId(`your-lists`).click()
    cy.findByTestId(`logout-button`).click()
    cy.findByTestId(`login-button`)
  })
})
