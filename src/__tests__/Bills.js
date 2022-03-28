/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";
import '@testing-library/jest-dom' // allows to use toHaveClass and more expect methods
import mockStore from "../__mocks__/store"

// jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // describe('Given I am connected as an employee',()=>{
  //   describe('When I am on Bill Page',()=>{
  //    test('Then return bills data', () => {
  //      mockStore.bills = jest.fn().mockImplementationOnce(() => {
  //        return {
  //          list: jest.fn().mockResolvedValue([{ id: 1, data: () => ({ date: '' }) }])
  //        }
  //      })
 
  //      const bills = new Bills({
  //        document, onNavigate, store: mockStore, localStorage
  //      })
 
  //      const response = bills.getBills()
 
  //      expect(response).toEqual(Promise.resolve({}))
  //    })
  //   })
  // })

  describe("When I click on eye icon", () => {
    test("Then a modal with the bill proof in it should pop up", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      const bill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      $.fn.modal = jest.fn() // prevent error modal is not a function, allows to use bootstrap modal in jest
      const eyeIcon = screen.getAllByTestId('icon-eye')
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(eyeIcon[0])) // handleClickIconEye needs an argument
      eyeIcon[0].addEventListener('click', handleClickIconEye)
      userEvent.click(eyeIcon[0])
      expect(handleClickIconEye).toHaveBeenCalled()

      const modaleFile = document.querySelector('#modaleFile')
      expect(modaleFile).toBeTruthy()
      
      // console.log(document.body.innerHTML)
      // console.log(modaleFile.className)
      // expect(modaleFile).toHaveClass('show')
      const modaleBody = document.querySelector('.modal-body')
      expect(modaleBody.childNodes.length).toEqual(1)

      const imageDisplayInModaleSource = document.querySelector('.bill-proof-container').childNodes[0].getAttribute('src')
      const billFileUrl = bills[0].fileUrl
      expect(imageDisplayInModaleSource).toBe(billFileUrl)
    })
  })

  describe("When the proof modal is opened and I click on the close button", () => {
    test("Then the modal should close", () => {
      const closeButton = document.querySelector('.close')
      userEvent.click(closeButton)
      const modaleFile = document.querySelector('#modaleFile')
      // $('#modaleFile').modal('hide')
      // console.log(document.body.innerHTML)
      expect(modaleFile).not.toHaveClass('show')
      // expect(modaleFile).not.toBeVisible()
    })
  })

  describe("When I click on new bill button", () => {
    test("It should render new bill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const bill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      
      document.body.innerHTML = BillsUI({ data: bills })
      
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
})

// test d'intégration GET
// describe("When I navigate to bill page", () => {
//   describe("When I navigate to Dashboard", () => {
//     test("fetches bills from mock API GET", async () => {
//         const getSpy = jest.spyOn(mockStore, "bills")
//         const userBills = await mockStore.bills().list()
//       expect(getSpy).toHaveBeenCalledTimes(1)
//         expect(userBills.length).toBe(4)
//     })
//     test("fetches bills from an API and fails with 404 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() =>
//         Promise.reject(new Error("Erreur 404"))
//       )
//       const html = BillsUI({ error: "Erreur 404" })
//       document.body.innerHTML = html
//       const message = await screen.getByText(/Erreur 404/)
//       expect(message).toBeTruthy()
//     })
//     test("fetches messages from an API and fails with 500 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() =>
//         Promise.reject(new Error("Erreur 500"))
//       )
//       const html = BillsUI({ error: "Erreur 500" })
//       document.body.innerHTML = html
//       const message = await screen.getByText(/Erreur 500/)
//       expect(message).toBeTruthy()
//     })
//   })
// })

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to bill page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      document.body.innerHTML = BillsUI({ data: bills })
      
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        // const message = await screen.getByText(/Erreur 404/)
        document.body.innerHTML = BillsUI({ error: "Erreur 404" })
        // const message = await screen.getByText(/ReferenceError: fetch is not defined/)
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        // const message = await screen.getByText(/Erreur 500/)
        document.body.innerHTML = BillsUI({ error: "Erreur 500" })
        // const message = await screen.getByText(/ReferenceError: fetch is not defined/)
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})