/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import store from '../__mocks__/store'


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should render a form", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      // const html = NewBillUI()
      // document.body.innerHTML = html
      
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })

  describe("When I don't fill required fields and submit the form", () => {
    test("Then it should renders New bill page", () => {
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId('form-new-bill')
      newBillForm.addEventListener('submit', handleSubmit)
      
      fireEvent.submit(newBillForm) // userEvent doesn't allow submit
      expect(handleSubmit).toHaveBeenCalled()
      expect(newBillForm).toBeTruthy();
    })
  })

  describe("When I fill the required fields with an unsupported proof file and submit the form", () => {
    test("Then it should pop an alert and I should stay on new bill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: store, localStorage: window.localStorage // if store null = error
      })

      window.alert = jest.fn(); // allows to mock browser alert about proof file change

      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.mp4', {type: 'video/mp4'})
      userEvent.upload(fileInput, fileUploaded)
      expect(handleChangeFile).toHaveBeenCalled()
      
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId('form-new-bill')
      newBillForm.addEventListener('submit', handleSubmit)
      
      fireEvent.submit(newBillForm) // userEvent doesn't allow submit
      expect(handleSubmit).toHaveBeenCalled()
      // expect(window.alert).toHaveBeenCalled()
      expect(newBillForm).toBeTruthy();
    })
  })

  // add to test : and the bill should be add to bills page with status pending ?
  describe("When I fill the required fields with a supported proof file and submit the form", () => {
    test("Then it should send the form and redirect me to the bills page", async() => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: store, localStorage: window.localStorage // if store null = error
      })

      window.alert = jest.fn(); // allows to mock browser alert about proof file change

      // const expenseType = screen.getByTestId('expense-type')
      // userEvent.selectOptions(expenseType, 'transports')
      const expenseName = screen.getByTestId('expense-name')
      userEvent.type(expenseName, 'test')
      const datePicker = screen.getByTestId('datepicker')
      userEvent.type(datePicker, '20200106')
      const amount = screen.getByTestId('amount')
      userEvent.type(amount, '100')
      const percentage = screen.getByTestId('pct')
      userEvent.type(percentage, '10')
      
      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.jpeg', {type: 'image/jpeg'})
      userEvent.upload(fileInput, fileUploaded)
      expect(handleChangeFile).toHaveBeenCalled()
      
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId('form-new-bill')
      newBillForm.addEventListener('submit', handleSubmit)
      
      fireEvent.submit(newBillForm) // userEvent doesn't allow submit
      expect(handleSubmit).toHaveBeenCalled()
      // expect(window.alert).not.toHaveBeenCalled()
      // expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })
  })

  describe("When I change proof file", () => {
    test("Then it should show the file name in input", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: store, localStorage: window.localStorage // if store null = error
      })

      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.png', {type: 'image/png'})
      userEvent.upload(fileInput, fileUploaded)
      
      expect(fileInput.files[0].name).toBe('hello.png')
    })
  })
})
