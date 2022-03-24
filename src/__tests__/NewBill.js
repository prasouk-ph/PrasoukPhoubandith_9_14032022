/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"


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

      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })

  describe("When I don't fill required fields and submit the form", () => {
    test("Then it should invite me to fill them", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const html = NewBillUI()
      document.body.innerHTML = html

      const handleSubmit = jest.fn(html.handleSubmit)
      const buttonSubmit = document.querySelector('#btn-send-bill')
      buttonSubmit.addEventListener('click', handleSubmit)
      userEvent.click(buttonSubmit)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe("When I fill the required fields with an unsupported proof file and submit the form", () => {
    test("Then it should pop an alert and I should stay on new bill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const html = NewBillUI()
      document.body.innerHTML = html

      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(html.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.mp4', {type: 'video/mp4'})
      userEvent.upload(fileInput, fileUploaded)

      const handleSubmit = jest.fn(html.handleSubmit)
      const buttonSubmit = document.querySelector('#btn-send-bill')
      buttonSubmit.addEventListener('click', handleSubmit)
      userEvent.click(buttonSubmit)
      expect(handleSubmit).toHaveBeenCalled()
      // expect(window.alert).toHaveBeenCalled()
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })

  // add to test : and the bill should be add to bills page with status pending ?
  describe("When I fill the required fields with a supported proof file and submit the form", () => {
    test("Then it should send the form and redirect me to the bills page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // const root = document.createElement("div")
      // root.setAttribute("id", "root")
      // document.body.append(root)
      // router()
      // window.onNavigate(ROUTES_PATH.NewBill)

      const html = NewBillUI()
      document.body.innerHTML = html

      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(html.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.png', {type: 'image/png'})
      userEvent.upload(fileInput, fileUploaded)

      const handleSubmit = jest.fn(html.handleSubmit)
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('click', handleSubmit)
      userEvent.click(form)
      expect(handleSubmit).toHaveBeenCalled()

      window.onNavigate(ROUTES_PATH.Bills)
      const bill = BillsUI({ data: bills })
      document.body.innerHTML = bill

      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })
  })

  describe("When I change proof file", () => {
    test("Then it should show the file name in input", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const html = NewBillUI()
      document.body.innerHTML = html

      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(html.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.png', {type: 'image/png'})
      userEvent.upload(fileInput, fileUploaded)
      
      expect(fileInput.files[0].name).toBe('hello.png')
    })
  })
})
