/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from '../__mocks__/store'
import router from "../app/Router";

jest.mock("../app/store", () => mockStore)

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
      
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })

  describe("When I change proof file", () => {
    test("Then it should show the file name in input", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage // if store null = error
      })

      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.png', {type: 'image/png'})
      userEvent.upload(fileInput, fileUploaded)
      
      expect(fileInput.files[0].name).toBe('hello.png')
    })

    describe("When I put an unsupported proof file", () => {
      test("Then it should pop an alert and file input should be empty", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const newBill = new NewBill({
          document, onNavigate, store: null, localStorage: window.localStorage
        })
  
        window.alert = jest.fn(); // allows to mock browser alert about proof file change
  
        const fileInput = screen.getByTestId('file')
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        fileInput.addEventListener('change', handleChangeFile)
        const fileUploaded = new File(['hello'], 'hello.mp4', {type: 'video/mp4'})
        userEvent.upload(fileInput, fileUploaded)
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalled()
        expect(fileInput.value).toMatch("")
      })
    })
  })

  describe("When I fill the required fields with a supported proof file and submit the form", () => {
    test("Then it should send the form and redirect me to the bills page", async() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage // if store null = error
      })

      window.alert = jest.fn(); // allows to mock browser alert about proof file change
      
      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      const fileUploaded = new File(['hello'], 'hello.jpeg', {type: 'image/jpeg'})
      userEvent.upload(fileInput, fileUploaded)
      expect(handleChangeFile).toHaveBeenCalled()
      expect(window.alert).not.toHaveBeenCalled()
      
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId('form-new-bill')
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm) // userEvent doesn't allow submit
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })
  })
})
