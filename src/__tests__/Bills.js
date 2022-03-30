/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router";
import '@testing-library/jest-dom' // allows to use toHaveClass and more expect methods

jest.mock("../app/store", () => mockStore)

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
      
      const modaleBody = document.querySelector('.modal-body')
      expect(modaleBody.childNodes.length).toEqual(1)

      const imageDisplayInModaleSource = document.querySelector('.bill-proof-container').childNodes[0].getAttribute('src')
      const billFileUrl = bills[0].fileUrl
      expect(imageDisplayInModaleSource).toBe(billFileUrl)
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
      
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
})

// Integration test GET
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
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})