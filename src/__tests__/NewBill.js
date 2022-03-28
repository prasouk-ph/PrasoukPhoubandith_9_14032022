/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
// import BillsUI from "../views/BillsUI.js"
// import { bills } from "../fixtures/bills.js"
import mockStore from '../__mocks__/store'

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

  describe("When I don't fill required fields and submit the form", () => {
    test("Then it should renders New bill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId('form-new-bill')
      newBillForm.addEventListener('submit', handleSubmit)
      
      fireEvent.submit(newBillForm) // userEvent doesn't allow submit
      expect(handleSubmit).toHaveBeenCalled()
      expect(newBillForm).toBeTruthy()
      // expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
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

    describe("When put an unsupported proof file", () => {
      test("Then it should pop an alert and file input should be empty", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const newBill = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage // if store null = error
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
        
        // const handleSubmit = jest.fn(newBill.handleSubmit)
        // const newBillForm = screen.getByTestId('form-new-bill')
        // newBillForm.addEventListener('submit', handleSubmit)
        
        // fireEvent.submit(newBillForm) // userEvent doesn't allow submit
        // expect(handleSubmit).toHaveBeenCalled()
        
        // // expect(newBillForm).toBeTruthy()
        // expect(screen.getByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })

  // add to test : and the bill should be add to bills page with status pending ?
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

      // const expenseType = screen.getByTestId('expense-type')
      // userEvent.selectOptions(expenseType, 'transports')
      // const expenseName = screen.getByTestId('expense-name')
      // userEvent.type(expenseName, 'test')
      // const datePicker = screen.getByTestId('datepicker')
      // userEvent.type(datePicker, '20200106')
      // const amount = screen.getByTestId('amount')
      // userEvent.type(amount, '100')
      // const percentage = screen.getByTestId('pct')
      // userEvent.type(percentage, '10')
      
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

// // test d'intégration POST
// describe('Given I am connected as an employee', () => {
//   // mock d'une connexion en tant qu'employé
//   window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
//   describe('When I send a NewBill form', () => {
//     test('Then fetches bill ID from mock API POST', async () => {
//       const dataBill = {
//         "id": "47qAXb6fIm2zOKkLzMro",
//         "vat": "80",
//         "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
//         "status": "pending",
//         "type": "Hôtel et logement",
//         "commentary": "séminaire billed",
//         "name": "encore",
//         "fileName": "preview-facture-free-201801-pdf-1.jpg",
//         "date": "2004-04-04",
//         "amount": 400,
//         "commentAdmin": "ok",
//         "email": "a@a",
//         "pct": 20
//       }
//       const postSpy = jest.spyOn(mockStore, "post")
//       const postBill = await mockStore.post(dataBill)
//       expect(postSpy).toHaveBeenCalled()
//       expect(postSpy).toReturn()
//       expect(postBill.id).toEqual(dataBill.id)
//     })
//   })
// })